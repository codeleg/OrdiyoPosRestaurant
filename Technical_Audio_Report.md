# Ses & Bildirim Sistemi Teknik Raporu 🔊🛡️

Bu rapor, PostRestoran projesindeki sesli uyarı ve bildirim altyapısının nasıl çalıştığını, hangi olayların sesi tetiklediğini ve olası sessizlik sorunlarının nasıl giderileceğini açıklar.

## 1. Mimari Yapı (Senior Level Design - v4.0)

Sistem, modern web standartlarına uygun olarak **Web Audio API** üzerine kurulmuştur. **Programatik Ses Üretimi** kullanır.

### Avantajları:
- **Dosya Bağımlılığı Yok:** Ses dosyası yüklemeye, CDN'e veya internete ihtiyaç duymaz.
- **Sıfır Gecikme:** Sesler o an matematiksel olarak üretildiği için anında çalar.
- **CORS Sorunsuz:** Dış kaynaklı bağlantı olmadığı için tarayıcı engellemesine takılmaz.

---

## 2. Ses Tetikleme Matrisi

| Olay / Durum | Tetiklenecek Ses | Teknik Açıklama |
| :--- | :--- | :--- |
| **Yeni Sipariş** | `notification` | Üçlü "Ding" sesi (Triangular Wave) |
| **Ödeme (Başarılı)** | `payment` | Kasa açılış sesi (C6-E6-G6 akoru) |
| **Sipariş Hazır** | `success` | Çift tonlu onay sesi |
| **Hata / Uyarı** | `error` | Düşük frekanslı uyarı tonu |
| **İptal / Geri** | `cancel` | Aşağı inen iki nota |

> **Not:** Sistem dosya tabanlı değildir, bu yüzden tarayıcınızın "Network" sekmesinde MP3 dosyası aramanıza gerek yoktur.

---

## 3. Sesin Çıkmama Nedenleri & Teşhis (Troubleshooting)

Tarayıcılar (Chrome, Edge vb.), kullanıcıyla etkileşime girilmeden (tıklama gibi) ses çalınmasını güvenlik gereği engeller.

### Kontrol Listesi:
1.  **Etkileşim Kilidi:** Sayfa açıldıktan sonra ekranda herhangi bir yere en az bir kez tıklamanız gerekir.
2.  **🥑 Avocado Logu Check:** F12 (Konsol) açtığınızda şu yazıyı görmelisiniz:
    `🥑 [AudioManager] I AM ALIVE!`
    Eğer bunu görüyorsanız, `window.audioManager` komutu konsolda kesinlikle çalışacaktır.
3.  **Tarayıcı İzinleri:**
    - Adres çubuğundaki kilit simgesine tıklayın → "Ses" iznini "İzin Ver" yapın.
4.  **Native Beep Testi:** Eğer hiçbir şey çalışmazsa konsola şunu yazın:
    ```javascript
    (new AudioContext()).resume(); // Test bip sesi
    ```

---

## 4. İlgili Dosyalar
- Merkezi Yönetim: [audio-manager.ts](file:///d:/PostRestoran/apps/web/src/lib/audio-manager.ts)
- Tetikleyiciler: [socket-provider.tsx](file:///d:/PostRestoran/apps/web/src/components/providers/socket-provider.tsx)
- Test Butonları: [sidebar.tsx](file:///d:/PostRestoran/apps/web/src/components/navigation/sidebar.tsx)
