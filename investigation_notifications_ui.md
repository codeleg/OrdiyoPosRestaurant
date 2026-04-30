# Araştırma Raporu: Bildirim ve UI Sorunları

Bu rapor, "Garson Çağır" butonunun görünmemesi ve personel tarafında bildirim seslerinin çalışmaması ile ilgili bulguları içermektedir.

## 1. Müşteri (Guest) Menüsünde Butonların Görünmemesi
Kod üzerinde yaptığım incelemede `ServiceActionMenu` (Hizmetler butonu) bileşeninin orada olduğunu teyit ettim. Ancak görünmemesinin muhtemel sebepleri şunlardır:

*   **Yerleşim (CSS) Çakışması**: Buton `fixed bottom-[130px]` (aşağıdan 130px yukarıda) olarak ayarlanmış. Eğer telefonun alt kısmında tarayıcı barı varsa veya "Siparişi Gör" (Sepet) butonu çok büyükse, bu buton ekranın dışında kalıyor veya sepet butonunun arkasında gizleniyor olabilir.
*   **Oturum (Session) Durumu**: Butonun görünmesi için geçerli bir misafir oturumu (`session`) gerekiyor. Eğer QR okutulduktan sonra oturum tam senkronize olamadıysa buton render edilmiyor olabilir.

## 2. Personel (Owner/Waiter) Bildirimlerinin Çalışmaması
Burada iki farklı teknik durum tespit ettim:

### A. Garsonlar (Waiters) Neden Yeni Sipariş Bildirimi Almıyor?
*   **Mimari Karar**: API tarafındaki `OrdersGateway` kodunda, "Yeni Sipariş" (`order.created`) bildirimlerinin garsonlara gönderilmemesi için bilerek bir filtre konulmuş. Kod yorum satırında "gürültüyü azaltmak için garsonlara gönderilmiyor" (prevent noise) ifadesi yer alıyor. Şu anki yapıda bu bildirim sadece **Patron (Owner), Müdür (Manager) ve Mutfak (Chef)** rollerine gidiyor.

### B. Patron (Owner) Neden Sesli Bildirim Almıyor?
*   **Tarayıcı Engeli (Autoplay Policy)**: Modern tarayıcılar (Chrome, Safari), kullanıcı sayfada en az bir yere tıklayana kadar ses çalınmasına izin vermez. Eğer panel açık duruyorsa ama hiç tıklama yapılmadıysa ses engelleniyor olabilir.
*   **Ses Sistemi Tutarsızlığı**: Projede iki farklı ses sistemi kullanılıyor. Siparişler için yeni `audioManager` kullanılırken, garson çağırma istekleri için eski bir yöntem kullanılıyor. Bu durum bazı tarayıcılarda çakışmaya yol açıyor olabilir.

## 🛠️ Önerilen Çözümler (Henüz Uygulanmadı)
1.  **Buton Konumu**: Misafir butonunun yerini `bottom-[130px]` yerine sepet butonuna daha uyumlu veya daha güvenli bir alana çekmek.
2.  **Bildirim Kapsamı**: Garson rolüne de (isteğe bağlı olarak) yeni sipariş bildirimlerini açmak.
3.  **Ses Sistemi Birleştirme**: Tüm bildirimleri yeni ve daha stabil olan `audioManager` üzerinden tek merkezden yönetmek.

---
**Onayınızla bu düzeltmeleri plana ekleyip uygulamaya geçebilirim.**
