# Ordiyo POS

## Yerel geliştirme (Docker)

Docker Desktop çalışır durumdayken proje kökünde:

```powershell
docker volume create docker_postgres_data
docker volume create docker_redis_data
docker compose up -d --build
docker compose ps
```

Arayüz `http://localhost:3000`, API health endpoint'i `http://localhost:3001/api/v1/health` adresindedir.

Demo giriş:

- Tenant: `mock-tenant`
- E-posta: `admin@postrestoran.com`
- Şifre: `admin123`

Logları izlemek için `docker compose logs -f api web`, servisleri durdurmak için
`docker compose down` komutunu kullanın. `down` varsayılan olarak veritabanı volume'larını silmez.
