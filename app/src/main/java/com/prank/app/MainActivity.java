package com.prank.app;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.os.Handler;
import android.os.Looper;
import android.os.Vibrator;
import android.view.View;
import android.view.animation.AlphaAnimation;
import android.view.animation.Animation;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import java.util.Random;

public class MainActivity extends Activity {

    private TextView tvSkull, tvTitle, tvSubtitle, tvProgress, tvCurrentFile;
    private TextView tvFileCount, tvCountdown, tvBtc, tvWarning, tvAprilMop;
    private ProgressBar progressBar;
    private LinearLayout rootLayout;

    private Handler handler;
    private Random random;
    private int fileCount = 0;
    private int progressValue = 0;

    // Daftar nama file palsu supaya terlihat nyata
    private final String[] fakeFiles = {
        "/sdcard/DCIM/Camera/IMG_20260401_142355.jpg",
        "/sdcard/DCIM/Camera/VID_20260328_091200.mp4",
        "/sdcard/WhatsApp/Media/Photos/WA0045.jpg",
        "/sdcard/WhatsApp/Databases/msgstore.db.crypt14",
        "/sdcard/Download/dokumen_penting.pdf",
        "/sdcard/Download/skripsi_final_rev3.docx",
        "/sdcard/Download/foto_ktp.jpg",
        "/sdcard/Download/slip_gaji_maret.pdf",
        "/sdcard/Pictures/Screenshots/Screenshot_2026.png",
        "/sdcard/Documents/password_list.txt",
        "/sdcard/DCIM/Camera/IMG_20260315_183022.jpg",
        "/sdcard/Music/playlist_favorit.m3u",
        "/sdcard/WhatsApp/Media/Video/VID-20260401.mp4",
        "/sdcard/Download/surat_lamaran.docx",
        "/sdcard/Download/rekening_bank.pdf",
        "/sdcard/Documents/catatan_rahasia.txt",
        "/sdcard/DCIM/Camera/IMG_20260220_074511.jpg",
        "/sdcard/Download/tugas_kuliah.pptx",
        "/sdcard/Pictures/foto_keluarga_2026.jpg",
        "/sdcard/WhatsApp/Media/Documents/kontrak_kerja.pdf",
        "/sdcard/Download/data_nasabah.xlsx",
        "/sdcard/Documents/diary_pribadi.txt",
        "/sdcard/DCIM/Camera/VID_20260112_200145.mp4",
        "/sdcard/Download/ijazah_scan.pdf",
        "/sdcard/Pictures/Screenshots/bukti_transfer.png",
        "/sdcard/Download/CV_terbaru_2026.pdf",
        "/sdcard/Music/lagu_kenangan.mp3",
        "/sdcard/WhatsApp/Media/Photos/WA0112.jpg",
        "/sdcard/Documents/PIN_ATM_notes.txt",
        "/sdcard/Download/sertifikat_vaksin.pdf",
        "/sdcard/DCIM/Camera/IMG_20260405_230917.jpg",
        "/sdcard/Download/proposal_bisnis.docx",
        "/sdcard/Pictures/meme_collection/meme_001.jpg",
        "/sdcard/WhatsApp/Databases/wa.db",
        "/sdcard/Android/data/com.instagram/cache/profile.jpg",
        "/sdcard/Download/tiket_pesawat.pdf",
        "/sdcard/Documents/nomor_rekening_semua.txt",
        "/sdcard/DCIM/.thumbnails/cache_full.db",
        "/sdcard/Download/foto_pacar.zip",
        "/sdcard/WhatsApp/Media/Audio/PTT-20260401.opus"
    };

    // Daftar pesan ancaman untuk ditampilkan bergantian
    private final String[] threatMessages = {
        "⚠ YOUR DEVICE HAS BEEN ENCRYPTED ⚠",
        "☠ ALL DATA WILL BE DESTROYED ☠",
        "🔒 SYSTEM LOCKED - NO ESCAPE 🔒",
        "⚠ ENCRYPTION IN PROGRESS... ⚠",
        "☠ YOUR FILES ARE BEING DELETED ☠"
    };

    private int threatIndex = 0;

    private void hideSystemUI() {
        View decorView = getWindow().getDecorView();
        decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        hideSystemUI();

        handler = new Handler(Looper.getMainLooper());
        random = new Random();

        // Temukan semua elemen UI
        rootLayout    = findViewById(R.id.root_layout);
        tvSkull       = findViewById(R.id.tv_skull);
        tvTitle       = findViewById(R.id.tv_title);
        tvSubtitle    = findViewById(R.id.tv_subtitle);
        progressBar   = findViewById(R.id.progress_bar);
        tvProgress    = findViewById(R.id.tv_progress);
        tvCurrentFile = findViewById(R.id.tv_current_file);
        tvFileCount   = findViewById(R.id.tv_file_count);
        tvCountdown   = findViewById(R.id.tv_countdown);
        tvBtc         = findViewById(R.id.tv_btc);
        tvWarning     = findViewById(R.id.tv_warning);
        tvAprilMop    = findViewById(R.id.tv_april_mop);

        // 1. Mulai getaran berulang
        startVibration();

        // 2. Mulai efek kedip pada tengkorak
        startBlinkEffect(tvSkull);

        // 3. Mulai simulasi enkripsi file palsu
        startFakeEncryption();

        // 4. Mulai pergantian teks ancaman
        startThreatRotation();

        // 5. Mulai hitung mundur 60 detik
        startCountdown();
    }

    /** Getaran HP berulang setiap 3 detik */
    private void startVibration() {
        final Vibrator vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
        if (vibrator == null) return;

        handler.post(new Runnable() {
            int count = 0;
            @Override
            public void run() {
                if (count < 20) { // Getar 20 kali selama 1 menit
                    vibrator.vibrate(500); // getar 500ms
                    count++;
                    handler.postDelayed(this, 3000); // ulangi tiap 3 detik
                }
            }
        });
    }

    /** Efek kedip merah pada elemen teks */
    private void startBlinkEffect(final View target) {
        final AlphaAnimation blink = new AlphaAnimation(1f, 0.2f);
        blink.setDuration(600);
        blink.setRepeatMode(Animation.REVERSE);
        blink.setRepeatCount(Animation.INFINITE);
        target.startAnimation(blink);
    }

    /** Simulasi progress enkripsi file palsu yang berjalan selama ~55 detik */
    private void startFakeEncryption() {
        handler.post(new Runnable() {
            @Override
            public void run() {
                if (progressValue < 100) {
                    // Pilih file acak dari daftar
                    String currentFile = fakeFiles[random.nextInt(fakeFiles.length)];
                    tvCurrentFile.setText("→ " + currentFile);

                    fileCount++;
                    tvFileCount.setText("Files encrypted: " + fileCount);

                    // Naikkan progress secara acak (1-3%)
                    progressValue += 1 + random.nextInt(3);
                    if (progressValue > 100) progressValue = 100;
                    progressBar.setProgress(progressValue);
                    tvProgress.setText("Encrypting files... " + progressValue + "%");

                    // Interval random 400ms-900ms agar terlihat realistis
                    long delay = 400 + random.nextInt(500);
                    handler.postDelayed(this, delay);
                } else {
                    tvProgress.setText("✓ Encryption complete.");
                    tvCurrentFile.setText("");
                    tvProgress.setTextColor(Color.parseColor("#FF0000"));
                }
            }
        });
    }

    /** Pergantian teks judul ancaman setiap 4 detik */
    private void startThreatRotation() {
        handler.post(new Runnable() {
            int count = 0;
            @Override
            public void run() {
                if (count < 15) { // 15 rotasi selama 60 detik
                    tvTitle.setText(threatMessages[threatIndex % threatMessages.length]);
                    threatIndex++;
                    count++;

                    // Ganti warna judul antara merah dan oranye
                    if (threatIndex % 2 == 0) {
                        tvTitle.setTextColor(Color.parseColor("#FF0000"));
                    } else {
                        tvTitle.setTextColor(Color.parseColor("#FF6600"));
                    }

                    handler.postDelayed(this, 4000);
                }
            }
        });
    }

    /** Hitung mundur 60 detik lalu tampilkan "April Mop" */
    private void startCountdown() {
        new CountDownTimer(60000, 1000) {
            @Override
            public void onTick(long millisUntilFinished) {
                long seconds = millisUntilFinished / 1000;
                long min = seconds / 60;
                long sec = seconds % 60;
                tvCountdown.setText(String.format("00:%02d:%02d", min, sec));

                // Warna mekin merah saat makin dekat ke 0
                if (seconds < 10) {
                    tvCountdown.setTextColor(Color.parseColor("#FF0000"));
                    startBlinkEffect(tvCountdown);
                } else if (seconds < 30) {
                    tvCountdown.setTextColor(Color.parseColor("#FF4400"));
                }
            }

            @Override
            public void onFinish() {
                revealAprilMop();
            }
        }.start();
    }

    /** Buka bungkus: tampilkan pesan "April Mop" */
    private void revealAprilMop() {
        // Sembunyikan semua elemen menakutkan
        tvSkull.clearAnimation();
        tvSkull.setVisibility(View.GONE);
        tvTitle.setVisibility(View.GONE);
        tvSubtitle.setVisibility(View.GONE);
        progressBar.setVisibility(View.GONE);
        tvProgress.setVisibility(View.GONE);
        tvCurrentFile.setVisibility(View.GONE);
        tvFileCount.setVisibility(View.GONE);
        tvCountdown.clearAnimation();
        tvCountdown.setVisibility(View.GONE);
        tvBtc.setVisibility(View.GONE);
        tvWarning.setVisibility(View.GONE);

        // Ubah latar belakang & tampilkan teks April Mop
        rootLayout.setBackgroundColor(Color.parseColor("#001100"));
        rootLayout.setGravity(android.view.Gravity.CENTER);
        tvAprilMop.setVisibility(View.VISIBLE);

        // Animasi fade-in
        AlphaAnimation fadeIn = new AlphaAnimation(0f, 1f);
        fadeIn.setDuration(1500);
        tvAprilMop.startAnimation(fadeIn);

        // Hentikan getaran
        Vibrator vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
        if (vibrator != null) vibrator.cancel();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemUI();
    }

    @Override
    public void onBackPressed() {
        // Tombol back dinonaktifkan
    }
}
