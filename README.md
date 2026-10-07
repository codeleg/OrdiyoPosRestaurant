
# Ordiyo Pos
Post Restaurant-Coffee SaaS Project
Bu rapor, Ordiyo Pos’u bir YouTube serisinde anlattığım beş derslik bir iskelet. 
Her ders hem “şunu aç, şunu yaz” hem de bir yazılım mühendisinin o katmanda bilmesi gereken kararı kapsar.

## Serinin omurgası

Uygulama tek bir program değil. Üç süreç birlikte çalışır:

| Parça | Klasör | Teknoloji | Adres |
|---|---|---|---|
| Arayüz | `apps/web` | Next.js 14 | http://localhost:3000 |
| API | `apps/api` | NestJS | http://localhost:3001 |
| Ortak tipler | `packages/shared` | TypeScript | npm paketi `@postrestoran/shared` |
| Veritabanı | Docker | PostgreSQL 15 | localhost:5432, veritabanı `pos_db` |
| Önbellek ve canlı oda | Docker | Redis 7 | localhost:6379 |

Tarayıcı sayfayı web’den alır. Veri isteği web üzerinden API’ye gider. API, Prisma ile Postgres’e yazar. Masa ve sipariş değişince Socket.IO, Redis üzerinden açık ekranlara haber verir.

Giriş (videoda göstereceğin hesap): `admin@demo.com` / `admin123`. Panel `http://localhost:3000/login` adresine düşer.

---

## Ders 1 — Makineyi ayağa kaldırmak

**Amaç:** İzleyici, “kod nerede, süreç nerede çalışıyor” ayrımını görsün.

**Ekranda**

1. Docker Desktop’ı aç. Balina ikonu yeşil olana kadar bekle. Postgres ve Redis senin bilgisayarında kurulu olmak zorunda değil; imaj olarak kalkacak.
2. Proje kökünü editörde aç: `OrdiyoPosRestaurant`. Kök, `package.json`, `docker-compose.yml` ve `apps` klasörünün durduğu yerdir.
3. Terminali de bu kökte aç. `apps/web` veya `apps/api` içinde `docker compose` çalıştırma; dosya kökte.

**Terminal**

```bash
cd /home/usermetin/projects/OrdiyoPosRestaurant
docker compose up -d
docker compose ps
```

Beklenen: `postgres` ve `redis` healthy, `api` healthy, `web` ayakta, `migration` exited (0). Migration bir kez şemayı uygular ve kapanır; sürekli çalışan bir servis değildir.

Kontrol:

```bash
curl http://127.0.0.1:3001/api/v1/health
```

Cevapta `database: connected` ve `redis: connected` görünür. Sonra tarayıcıda http://localhost:3000.

**İkinci yol (videoda “geliştirici bunu neden ister” diye anlat).** Sadece veritabanını Docker’da bırakıp kodu kendi makinede izlemek istersen, kökte:

```bash
docker compose up -d postgres redis
npm run dev
```

`npm run dev` Turbo ile kökten hem `apps/api` hem `apps/web` içindeki `dev` script’lerini kaldırır. Ayrı ayrı çalıştırmak da mümkün: API için `npm run dev --workspace=api`, web için `npm run dev --workspace=web`. İkisi de kökten verilir. Web tek başına `apps/web` içinde `npm run dev` ile de açılır, ama API ve Postgres yoksa girişten sonra veri gelmez.

**Bu derste öğretilecek mühendislik**

- Kök `package.json` bir monorepo manifestosudur. `workspaces: ["apps/*", "packages/*"]` der ki alt klasörler ayrı paket, tek `node_modules` ailesi.
- `docker-compose.yml` süreçlerin sözleşmesidir: imaj, port, ortam dosyası, “şundan sonra kalk”.
- `.env` senin makinen içindir (`localhost`). `.env.docker` konteyner içindir (`postgres`, `redis`, `api` servis adları). Aynı şifre, farklı adres. Bunu karıştırmak “veritabanına bağlanamıyor” hatasının klasik sebebidir.
- Geliştirme komutları izleme modudur: web `next dev -p 3000`, API `nest start --watch`. İlk sayfa derlenirken ekran bekler; bu Postgres’in yavaş olduğu anlamına gelmez.

**Kapanış cümlesi:** “Üç terminal süreci var: web, API, veri. Hepsini tek komutla kaldırdık. Şimdi klasörlerin hangi sürece ait olduğuna bakacağız.”

---

## Ders 2 — Klasör haritası ve bir isteğin yolu

**Amaç:** Dosya ağacını ezberletmek değil, “bu dosyayı değiştirirsem hangi kutu etkilenir” refleksini vermek.

**Kökte durup anlat**

```text
OrdiyoPosRestaurant/
  apps/web/          kullanıcının gördüğü Next.js uygulaması
  apps/api/          iş kurallarının durduğu NestJS uygulaması
  packages/shared/   iki tarafın paylaştığı tipler ve olay adları
  docker/            api.Dockerfile, web.Dockerfile
  docker-compose.yml dört servisi birbirine bağlar
  turbo.json         build sırası: shared önce, uygulamalar sonra
```

`apps/web/src` içinde iş bölünmüş:

- `app/` adresler. Parantezli gruplar URL’ye yazılmaz: `(auth)`, `(dashboard)`, `(guest)`.
- `features/` ekranın davranışı: `tables`, `order`, `kitchen`, `pos`, `guest`, `staff`, `reports`.
- `lib/api` tarayıcının API’ye gidiş kapısı (`fetchApi`).
- `components/ui` ortak görünen parçalar.

`apps/api/src` içinde:

- `main.ts` süreci açar: port 3001, önek `api/v1`, CORS, doğrulama, Socket.IO.
- `app.module.ts` modül listesidir. Yeni bir iş alanı buraya bağlanmadan HTTP olmaz.
- `modules/` iş alanları: `auth`, `catalog`, `tables`, `orders`, `payment`, `staff`, `reports`, `guest-ordering`, `billing`.
- `shared/` her modülün kullandığı Prisma, tenant filtresi, JWT ve rol korumaları.
- `prisma/schema.prisma` tabloların kaynağı. `prisma/migrations/` bu şemanın uygulanmış hali.

`packages/shared/src` küçük ve bilinçli küçüktür: `UserRole`, plan kontrolü, `SocketEvents`. Web “order.created” diye bir string uydurmaz; API ile aynı sabiti kullanır.

**Bir giriş isteğini tahtada çiz**

1. `apps/web/src/app/(auth)/login/page.tsx` formu gönderir.
2. `fetchApi('/auth/login')` çağrılır. `localhost`’ta adres `/api/v1` olur.
3. `apps/web/next.config.js` içindeki rewrite, `/api/...` isteğini API konteynerine (`http://api:3001`) taşır.
4. Nest global önek yüzünden gerçek yol `POST /api/v1/auth/login` olur.
5. `auth.service.ts` e-postayı bulur, bcrypt hash’i karşılaştırır, şifreyi cevaptan atar, JWT üretir.
6. Web token’ı `auth-store` içine koyar. Rol `OWNER` veya `MANAGER` ise `/dashboard`, değilse `/tables`.

**Bu derste öğretilecek mühendislik**

- Sunum ile kuralı ayırmak: sayfa dosyası “nasıl görünür”, servis “ne olur” sorusunun cevabıdır.
- Sözleşme tek yerde durur. Rol enum’u ve soket olay adı `packages/shared` içindedir; iki tarafta kopyalanırsa biri sessizce bozulur.
- `turbo.json` içinde `build.dependsOn: ["^build"]` şunu der: bir paket build olmadan ona bağlı paket build olmaz. Shared değişince önce o derlenir.

**Kapanış:** “Klasör, takımın sınırıdır. Sıradaki ders o sınırın API içinde nasıl çizildiğini açacak.”

---

## Ders 3 — API: modül, katman, veritabanı, kiracı

**Amaç:** NestJS’i “controller yazdım bitti” seviyesinden çıkarıp çok kiracılı bir SaaS API’si olarak okutmak.

**Modülün içi.** `orders` tipik örnektir:

- `presentation/orders.controller.ts` HTTP’yi karşılar, gövdeyi DTO ile alır.
- `application/orders.service.ts` siparişi kurar, stok ve toplamla ilgilenir.
- `gateways/orders.gateway.ts` aynı olayı bağlı istemcilere yayınlar.

Aynı ayrım `auth`, `catalog`, `tables`, `staff` içinde de vardır. `presentation` dışarıya konuşur. `application` kararı verir. `domain` ve `infrastructure` olan modüllerde kural ile Prisma/Stripe gibi dış sistem ayrılır.

**İstek içeri girince sıra şöyledir** (`app.module.ts`):

1. `TenantResolverMiddleware` kiracıyı çözer.
2. `JwtAuthGuard` token var mı diye bakar. Açık uçlar (giriş, kayıt, sağlık) bu korumanın dışında işaretlenir.
3. `RolesGuard` rolü yeter mi diye bakar: `OWNER`, `MANAGER`, `CASHIER`, `WAITER`, `KITCHEN`.
4. `PlanGuard` plan bu özelliğe izin veriyor mu diye bakar: `FREE`, `PRO`, `PREMIUM`.
5. `TenantInterceptor` sonraki sorgular için kiracı kimliğini bağlama koyar.

**Veri.** `schema.prisma` içinde merkez `Tenant`. Kategori, ürün, masa, sipariş, kullanıcı, stok hepsi `tenantId` taşır. İki restoran aynı veritabanında durur; A’nın siparişi B’ye karışmaz. Bunu her serviste elle yazmak yerine `TenantIsolationExtension` okuma ve yazmaya `tenantId` ekler. Mühendis şunu bilir: güvenlik “unutmazsak filtreleriz” diye bırakılmaz, sorgu katmanına gömülür.

Şifre düz metin değildir. `PasswordService` bcrypt ile 10 tur hash’ler. Girişte `compare` yapılır.

**Canlılık.** Sipariş yalnızca HTTP cevabı değildir. `orders.gateway.ts` olayı yayınlar. `main.ts` Socket.IO’yu Redis adaptörüne bağlar; birden fazla API süreci olsa da aynı odaya düşerler. Olay adları `packages/shared/src/socket-events.ts` içindedir: `order.created`, `table.updated`, `service.request.created`.

**Bu derste öğretilecek mühendislik**

- Global prefix (`api/v1`) sürüm sözleşmesidir. Ekranlar `/orders` der, ağda yol `/api/v1/orders` olur.
- Guard sırası yetki modelidir: kimlik, rol, plan. Üçü karışırsa “giriş yapmış ama bu sayfa yasak” ile “plan yetmiyor” aynı hataya döner.
- Migration, şemanın tarihidir. `docker compose` içindeki `migration` servisi `prisma migrate deploy` çalıştırır. Elle tabloda kolon değiştirip şemayı unutmak, bir sonraki kalkışta kaybolan bir değişikliktir.
- Sağlık ucu `GET /api/v1/health` süreç ayakta mı, Postgres ve Redis cevap veriyor mu diye bakar. Videoda “çalışıyor mu?” sorusunun cevabı budur, tarayıcıdaki spinner değil.

**Kapanış:** “API kiracıyı, rolü ve planı kapıda keser. Ekran bunu nasıl tüketiyor, ona geçiyoruz.”

---

## Ders 4 — Web: sayfa, özellik, durum

**Amaç:** Next.js App Router’da dosya yolunun ürün yoluna nasıl denk geldiğini göstermek.

**Üç ürün, üç grup**

| Grup | URL örneği | Kim |
|---|---|---|
| `(auth)` | `/login`, `/register`, `/pos-login` | henüz içeri girmemiş kişi veya POS cihazı |
| `(dashboard)` | `/dashboard`, `/tables`, `/orders/[tableId]`, `/kitchen` | personel |
| `(guest)` | `/guest/menu`, `/guest/cart` | masadaki müşteri, QR ile |

`app/(dashboard)/tables/page.tsx` ince bir sayfadır. Asıl masa ekranı `features/tables` altındadır. Bu ayrım büyüyünce işe yarar: route dosyası adres ve yerleşim, feature dosyası davranış.

**Veri nasıl gelir**

- `lib/api.ts` içindeki `fetchApi` token’ı `Authorization` başlığına koyar, `credentials: 'include'` ile çerezi de gönderir.
- `lib/store/auth-store` girişten sonra kullanıcı ve token’ı tutar. Sayfalar localStorage’ı kendileri okumaz.
- `lib/api/services/order.service.ts` ve `catalog.service.ts` tekrarlayan çağrıları tek yerde toplar.
- `@tanstack/react-query` sunucu verisini önbelleğe alır. Zustand ise ekranın kendi hali içindir (açık modal, seçili masa). İkisini aynı yere koymak, “sunucu öyle dedi ama ekran eski kaldı” hatalarını üretir.

**POS’un ikinci kapısı.** `/pos-login` e-posta değil, kullanıcı adı ve 4 haneli PIN ister. Bu, kasanın yanında duran cihaz içindir. Yönetici paneli `/login` ile e-posta ve şifre kullanır. Aynı `User` tablosu, iki giriş şekli.

**Bu derste öğretilecek mühendislik**

- `'use client'` yazan dosya tarayıcıda çalışır. Form, soket, Zustand orada durur. Varsayılan sunucu bileşenine `useState` koyulmaz.
- Dinamik parça köşeli parantezdir: `orders/[tableId]`. Masa kimliği URL’den okunur, ikinci bir global değişkene gizlenmez.
- Rewrite, tarayıcıyı API portuna zorlamamak içindir. `localhost`’ta istek `3000` üzerinden `3001`’e aktarılır. Telefonda test ederken `getApiUrl` hostname’e bakıp doğrudan `:3001` kullanır. Bu yüzden `.env.docker` içindeki `FRONTEND_URL` ve `CORS_ORIGINS` videoda “neden mobilde açılmıyor” sorusunun cevabıdır.
- Özellik klasörü (`features/kitchen`, `features/guest`) bir ekranı başka ekranın içine gömmek yerine kendi hook, store ve bileşenine sahip olur.

**Kapanış:** “Ekran ince, kural API’de, durum ikiye ayrılmış: sunucu verisi ve ekran hali. Son derste bir siparişin bu parçaları nasıl dolaştığını baştan sona bağlayacağız.”

---

## Ders 5 — Bir siparişin hayatı ve mühendisin kontrol listesi

**Amaç:** Parçaları tek bir iş hikâyesinde birleştirmek. İzleyici seri bittiğinde bir değişiklik isteğini doğru klasöre götürebilmeli.

**Masadaki sipariş, adım adım**

1. Garson `/tables` açar. `TablesService.getZones` bölgeleri, masaları ve açık siparişi tek sorguda getirir.
2. Masa seçilir: `/orders/[tableId]` veya `/tables/[tableId]`.
3. Menü `CatalogService.getProducts` ile gelir: ürün, seçenek grupları, stok.
4. Gönderimde `OrdersService` ürün ve seçenekleri doğrular, satırları yazar, toplamı hesaplar.
5. `orders.gateway` `order.created` yayınlar. Mutfak ekranı (`features/kitchen`) kendi yenilemesini beklemeden duyar.
6. Ödeme `payment` ve `payment-orchestrator` tarafına düşer. Ortamda `PAYMENT_PROVIDER=MOCK` olduğu için gerçek kart çekilmez; akış aynı kapıdan yürür.
7. Müşteri QR ile gelirse `guest-ordering` devrededir. Bu modül `GUEST_ORDERING_ENABLED=true` iken `app.module.ts` içine eklenir. Kapalıysa route hiç yüklenmez.

**SaaS katmanı.** Kayıt `onboarding` ile yeni `Tenant` ve `OWNER` açar. Plan `feature-matrix` ve `check-plan-access` ile hem API’de hem paylaşılmış pakette kontrol edilir. Raporlar gibi bazı işler plana bağlıdır. Stripe müşteri kimliği şemada durur; yerel ortamda anahtar yoksa mock müşteri yazılır. Faturalama `billing` modülündedir.

**Videoyu kapatırken tahtaya yazılacak kontrol listesi**

- Değişiklik hangi kutuda? Görüntü `apps/web`, kural `apps/api`, iki tarafın adı `packages/shared`.
- Yeni tablo önce `schema.prisma`, sonra migration. Yalnızca çalışan veritabanına kolon eklemek yetmez.
- Yeni uç: DTO, controller, servis, `*.module.ts`, en sonda `app.module.ts` import’u.
- Yeni ekran: `app/.../page.tsx` ince kalsın, davranış `features/` altına gitsin.
- Her sorgunun bir kiracısı olsun. Extension bunu zorlar; public menü gibi istisnalar bilinçli bypass’tır.
- Şifre ve PIN log’a ve cevaba düz yazılmaz.
- Sağlık ucu, login ve bir masa listesi: yayın öncesi üç kontrol. İlki süreç, ikincisi kimlik, üçüncüsü kiracılı veri.
- Yavaşlık görürsen önce geliştirme derlemesine bak. `next dev` ve `nest start --watch`, kaynak kod Docker’a bağlanmışken ilk istekte derler. Aynı sayfanın ikinci açılışı asıl hızdır.

**Seri cümlesi:** “Ordiyo Pos bir restoran ekranı değil. Kiracıyı kapıda ayıran, rol ve planla yetki veren, siparişi hem veritabanına hem mutfak ekranına aynı anda yazan bir SaaS. Dosya yapısı bu cümlenin klasör karşılığı.”
