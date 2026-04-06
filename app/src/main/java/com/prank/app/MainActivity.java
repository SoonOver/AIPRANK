package com.prank.app;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.SurfaceTexture;
import android.hardware.Camera;
import android.media.AudioManager;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.os.Handler;
import android.os.Looper;
import android.os.Vibrator;
import android.view.Gravity;
import android.view.TextureView;
import android.view.View;
import android.view.WindowManager;
import android.view.animation.AlphaAnimation;
import android.view.animation.Animation;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Collections;
import java.util.List;
import java.util.Random;

@SuppressWarnings("deprecation")
public class MainActivity extends Activity {

    private static final int CAMERA_PERMISSION_CODE = 100;

    private TextView tvSkull, tvTitle, tvSubtitle, tvDeviceInfo, tvCamera, tvRec;
    private TextView tvProgress, tvCurrentFile, tvFileCount, tvDestructive;
    private TextView tvCountdown, tvCountdownLabel, tvBtc, tvWarning, tvAprilMop;
    private ProgressBar progressBar;
    private LinearLayout rootLayout;
    private TextureView cameraPreview;
    private FrameLayout cameraFrame;

    private Camera camera;
    private Handler handler;
    private Random random;
    private int fileCount = 0;
    private int contactCount = 0;
    private int progressValue = 0;
    private boolean isRevealed = false;
    private boolean prankStarted = false;

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
        "/sdcard/WhatsApp/Media/Video/VID-20260401.mp4",
        "/sdcard/Download/surat_lamaran.docx",
        "/sdcard/Download/rekening_bank.pdf",
        "/sdcard/Documents/catatan_rahasia.txt",
        "/sdcard/Download/tugas_kuliah.pptx",
        "/sdcard/Pictures/foto_keluarga_2026.jpg",
        "/sdcard/WhatsApp/Media/Documents/kontrak_kerja.pdf",
        "/sdcard/Download/data_nasabah.xlsx",
        "/sdcard/Documents/diary_pribadi.txt",
        "/sdcard/Download/ijazah_scan.pdf",
        "/sdcard/Pictures/Screenshots/bukti_transfer.png",
        "/sdcard/Download/CV_terbaru_2026.pdf",
        "/sdcard/Documents/PIN_ATM_notes.txt",
        "/sdcard/Download/sertifikat_vaksin.pdf",
        "/sdcard/Android/data/com.instagram/cache/profile.jpg",
        "/sdcard/Download/tiket_pesawat.pdf",
        "/sdcard/Documents/nomor_rekening_semua.txt",
        "/sdcard/Download/foto_selfie_privat.zip",
        "/sdcard/WhatsApp/Media/Audio/PTT-20260401.opus",
        "/sdcard/Download/mobile_banking_backup.db",
        "/sdcard/Documents/password_wifi_semua.txt",
        "/sdcard/Telegram/Photos/private_chat_001.jpg",
        "/sdcard/Download/laporan_keuangan_2026.xlsx",
        "/sdcard/Android/data/com.whatsapp/files/Avatars.db",
        "/sdcard/Download/scan_akta_kelahiran.pdf"
    };

    private final String[] threatMessages = {
        "\u26A0 YOUR DEVICE HAS BEEN ENCRYPTED \u26A0",
        "\u2620 ALL DATA WILL BE DESTROYED \u2620",
        "\uD83D\uDD12 SYSTEM LOCKED \u2014 NO ESCAPE \uD83D\uDD12",
        "\u26A0 ENCRYPTION COMPLETE \u2014 PAY NOW \u26A0",
        "\u2620 YOUR PHOTOS ARE BEING UPLOADED \u2620",
        "\uD83D\uDD12 CONTACTS EXPORTED TO DARK WEB \uD83D\uDD12",
        "\u26A0 BANK DATA COMPROMISED \u26A0",
        "\u2620 GPS LOCATION SHARED \u2620"
    };

    private final String[] destructiveActions = {
        "\u2713 Scanning contacts database...",
        "\u2713 Contacts exported: 247 entries",
        "\u2713 Reading SMS messages...",
        "\u2713 SMS database dumped: 1,832 messages",
        "\u2713 Accessing photo gallery...",
        "\u2713 Photos uploaded: 1,459 files",
        "\u2713 Scanning banking apps...",
        "\u2713 BCA Mobile \u2014 credentials captured",
        "\u2713 GoPay \u2014 wallet data extracted",
        "\u2713 OVO \u2014 transaction history saved",
        "\u2713 Accessing WhatsApp database...",
        "\u2713 Chat history exported: 24,571 messages",
        "\u2713 Scanning saved passwords...",
        "\u2713 Chrome passwords dumped: 89 entries",
        "\u2713 Front camera activated...",
        "\u2713 Face photo captured and uploaded",
        "\u2713 GPS coordinates logged & sent",
        "\u2713 Device microphone activated...",
        "\u2713 Wiping recovery partition...",
        "\u2713 Formatting internal storage..."
    };

    private int threatIndex = 0;
    private int destructiveIndex = 0;

    // ==================== LIFECYCLE ====================

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Layar selalu menyala + brightness max
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        WindowManager.LayoutParams lp = getWindow().getAttributes();
        lp.screenBrightness = 1.0f;
        getWindow().setAttributes(lp);

        // Volume max
        try {
            AudioManager audio = (AudioManager) getSystemService(AUDIO_SERVICE);
            if (audio != null) {
                audio.setStreamVolume(AudioManager.STREAM_RING,
                    audio.getStreamMaxVolume(AudioManager.STREAM_RING), 0);
            }
        } catch (Exception ignored) {}

        setContentView(R.layout.activity_main);
        hideSystemUI();

        handler = new Handler(Looper.getMainLooper());
        random = new Random();

        // Bind views
        rootLayout       = findViewById(R.id.root_layout);
        tvSkull           = findViewById(R.id.tv_skull);
        tvTitle           = findViewById(R.id.tv_title);
        tvSubtitle        = findViewById(R.id.tv_subtitle);
        tvDeviceInfo      = findViewById(R.id.tv_device_info);
        cameraPreview     = findViewById(R.id.camera_preview);
        cameraFrame       = (FrameLayout) cameraPreview.getParent();
        tvCamera          = findViewById(R.id.tv_camera);
        tvRec             = findViewById(R.id.tv_rec);
        progressBar       = findViewById(R.id.progress_bar);
        tvProgress        = findViewById(R.id.tv_progress);
        tvCurrentFile     = findViewById(R.id.tv_current_file);
        tvFileCount       = findViewById(R.id.tv_file_count);
        tvDestructive     = findViewById(R.id.tv_destructive);
        tvCountdown       = findViewById(R.id.tv_countdown);
        tvCountdownLabel  = findViewById(R.id.tv_countdown_label);
        tvBtc             = findViewById(R.id.tv_btc);
        tvWarning         = findViewById(R.id.tv_warning);
        tvAprilMop        = findViewById(R.id.tv_april_mop);

        // Tampilkan info device ASLI
        showRealDeviceInfo();

        // Coba minta permission kamera, tapi langsung mulai prank
        // tanpa menunggu hasilnya
        requestCameraAndStart();
    }

    @Override
    protected void onPause() {
        super.onPause();
        releaseCamera();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        releaseCamera();
        if (handler != null) handler.removeCallbacksAndMessages(null);
    }

    // ==================== PERMISSION FLOW ====================

    /** Minta permission kamera, tapi prank LANGSUNG dimulai
     *  tanpa menunggu jawaban user. */
    private void requestCameraAndStart() {
        // Langsung mulai semua efek prank dulu
        startAllPrankEffects();

        // Baru coba minta permission kamera (di background)
        if (Build.VERSION.SDK_INT >= 23) {
            if (checkSelfPermission(Manifest.permission.CAMERA)
                    == PackageManager.PERMISSION_GRANTED) {
                setupCamera();
            } else {
                requestPermissions(
                    new String[]{Manifest.permission.CAMERA},
                    CAMERA_PERMISSION_CODE);
            }
        } else {
            // Android < 6.0: permission otomatis dari manifest
            setupCamera();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode,
            String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == CAMERA_PERMISSION_CODE) {
            if (grantResults.length > 0
                    && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // Permission diberikan → nyalakan kamera asli
                setupCamera();
            } else {
                // Permission ditolak → tetap tampilkan teks "CAMERA ACTIVE"
                // tapi tanpa preview asli (korban tetap panik)
                cameraPreview.setVisibility(View.GONE);
                tvCamera.setText("\uD83D\uDCF8 CAMERA ACTIVATED \u2014 RECORDING...");
                startBlinkEffect(tvRec);
            }
        }
    }

    // ==================== CAMERA ====================

    private void setupCamera() {
        cameraPreview.setSurfaceTextureListener(new TextureView.SurfaceTextureListener() {
            @Override
            public void onSurfaceTextureAvailable(SurfaceTexture surface, int w, int h) {
                openFrontCamera(surface);
            }
            @Override
            public void onSurfaceTextureSizeChanged(SurfaceTexture s, int w, int h) {}
            @Override
            public boolean onSurfaceTextureDestroyed(SurfaceTexture surface) {
                releaseCamera();
                return true;
            }
            @Override
            public void onSurfaceTextureUpdated(SurfaceTexture surface) {}
        });
    }

    private void openFrontCamera(SurfaceTexture surface) {
        try {
            int frontCamId = -1;
            Camera.CameraInfo info = new Camera.CameraInfo();
            for (int i = 0; i < Camera.getNumberOfCameras(); i++) {
                Camera.getCameraInfo(i, info);
                if (info.facing == Camera.CameraInfo.CAMERA_FACING_FRONT) {
                    frontCamId = i;
                    break;
                }
            }
            if (frontCamId == -1) {
                // Tidak ada kamera depan, gunakan kamera belakang
                frontCamId = 0;
            }

            camera = Camera.open(frontCamId);
            camera.setDisplayOrientation(90);
            camera.setPreviewTexture(surface);
            camera.startPreview();

            // Kamera berhasil → tampilkan overlay "REC" berkedip
            tvCamera.setText("\uD83D\uDCF8 FRONT CAMERA ACTIVE \u2014 RECORDING YOUR FACE...");
            startBlinkEffect(tvRec);

        } catch (Exception e) {
            // Gagal buka kamera → tetap jalan tanpa preview
            cameraPreview.setVisibility(View.GONE);
            tvCamera.setText("\uD83D\uDCF8 CAMERA ACTIVATED \u2014 RECORDING...");
            startBlinkEffect(tvRec);
        }
    }

    private void releaseCamera() {
        if (camera != null) {
            try {
                camera.stopPreview();
                camera.release();
            } catch (Exception ignored) {}
            camera = null;
        }
    }

    // ==================== DEVICE INFO ASLI ====================

    private void showRealDeviceInfo() {
        String ip = getLocalIpAddress();
        String info = "TARGET DEVICE IDENTIFIED\n"
            + "Manufacturer: " + Build.MANUFACTURER.toUpperCase() + "\n"
            + "Model: " + Build.MODEL + "\n"
            + "Android: " + Build.VERSION.RELEASE + " (API " + Build.VERSION.SDK_INT + ")\n"
            + "Build: " + Build.DISPLAY + "\n"
            + "Hardware: " + Build.HARDWARE + "\n"
            + "Board: " + Build.BOARD + "\n"
            + "IP Address: " + ip + "\n"
            + "Status: INFECTED \u2014 Backdoor Active";
        tvDeviceInfo.setText(info);
    }

    private String getLocalIpAddress() {
        try {
            // Coba via WifiManager dulu
            WifiManager wm = (WifiManager) getApplicationContext()
                    .getSystemService(WIFI_SERVICE);
            if (wm != null) {
                WifiInfo wi = wm.getConnectionInfo();
                int ipInt = wi.getIpAddress();
                if (ipInt != 0) {
                    return String.format("%d.%d.%d.%d",
                        (ipInt & 0xff), (ipInt >> 8 & 0xff),
                        (ipInt >> 16 & 0xff), (ipInt >> 24 & 0xff));
                }
            }
        } catch (Exception ignored) {}

        // Fallback: scan network interfaces
        try {
            List<NetworkInterface> interfaces =
                Collections.list(NetworkInterface.getNetworkInterfaces());
            for (NetworkInterface ni : interfaces) {
                List<InetAddress> addrs = Collections.list(ni.getInetAddresses());
                for (InetAddress addr : addrs) {
                    if (!addr.isLoopbackAddress()
                            && addr.getHostAddress().indexOf(':') < 0) {
                        return addr.getHostAddress();
                    }
                }
            }
        } catch (Exception ignored) {}

        return "192.168.1." + (new Random().nextInt(254) + 1);
    }

    // ==================== PRANK EFFECTS ====================

    /** Mulai semua efek prank sekaligus tanpa menunggu permission */
    private void startAllPrankEffects() {
        if (prankStarted) return;
        prankStarted = true;

        startBlinkEffect(tvSkull);
        startVibration();
        startFakeEncryption();
        startThreatRotation();
        startDestructiveActions();
        startScreenFlash();
        startCountdown();
    }

    private void startVibration() {
        final Vibrator vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
        if (vibrator == null) return;

        handler.post(new Runnable() {
            int tick = 0;
            @Override
            public void run() {
                if (isRevealed) return;
                int interval, duration;
                if (tick < 10) {
                    duration = 300; interval = 3000;
                } else if (tick < 20) {
                    duration = 500; interval = 2000;
                } else {
                    duration = 800; interval = 800;
                }
                vibrator.vibrate(duration);
                tick++;
                handler.postDelayed(this, interval);
            }
        });
    }

    private void vibrateHard(int ms) {
        Vibrator v = (Vibrator) getSystemService(VIBRATOR_SERVICE);
        if (v != null) v.vibrate(ms);
    }

    private void startBlinkEffect(View target) {
        AlphaAnimation blink = new AlphaAnimation(1f, 0.1f);
        blink.setDuration(500);
        blink.setRepeatMode(Animation.REVERSE);
        blink.setRepeatCount(Animation.INFINITE);
        target.startAnimation(blink);
    }

    private void startScreenFlash() {
        handler.post(new Runnable() {
            boolean isRed = false;
            @Override
            public void run() {
                if (isRevealed) return;
                rootLayout.setBackgroundColor(
                    isRed ? Color.BLACK : Color.parseColor("#1A0000"));
                isRed = !isRed;
                handler.postDelayed(this, 2000 + random.nextInt(3000));
            }
        });
    }

    private void startFakeEncryption() {
        handler.post(new Runnable() {
            @Override
            public void run() {
                if (isRevealed) return;
                if (progressValue < 100) {
                    String f = fakeFiles[random.nextInt(fakeFiles.length)];
                    tvCurrentFile.setText("\u2192 " + f);
                    fileCount++;
                    contactCount = Math.min(contactCount + random.nextInt(5), 247);
                    tvFileCount.setText("Files encrypted: " + fileCount
                        + " | Contacts stolen: " + contactCount);
                    progressValue += 1 + random.nextInt(2);
                    if (progressValue > 100) progressValue = 100;
                    progressBar.setProgress(progressValue);
                    tvProgress.setText("Encrypting files... " + progressValue + "%");
                    handler.postDelayed(this, 300 + random.nextInt(600));
                } else {
                    tvProgress.setText("\u26A0 ENCRYPTION COMPLETE \u2014 ALL FILES LOCKED");
                    tvProgress.setTextColor(Color.parseColor("#FF0000"));
                    tvCurrentFile.setText("\u2192 /system/data \u2014 ROOT ACCESS OBTAINED");
                    tvCurrentFile.setTextColor(Color.parseColor("#FF4400"));
                    vibrateHard(1500);
                }
            }
        });
    }

    private void startThreatRotation() {
        handler.post(new Runnable() {
            @Override
            public void run() {
                if (isRevealed) return;
                tvTitle.setText(threatMessages[threatIndex % threatMessages.length]);
                threatIndex++;
                int c = threatIndex % 3;
                if (c == 0) tvTitle.setTextColor(Color.parseColor("#FF0000"));
                else if (c == 1) tvTitle.setTextColor(Color.parseColor("#FF6600"));
                else tvTitle.setTextColor(Color.parseColor("#FFCC00"));
                handler.postDelayed(this, 3500);
            }
        });
    }

    private void startDestructiveActions() {
        handler.postDelayed(new Runnable() {
            StringBuilder log = new StringBuilder();
            @Override
            public void run() {
                if (isRevealed) return;
                if (destructiveIndex < destructiveActions.length) {
                    log.append(destructiveActions[destructiveIndex]).append("\n");
                    tvDestructive.setText(log.toString().trim());
                    destructiveIndex++;
                    vibrateHard(150);
                    handler.postDelayed(this, 2500 + random.nextInt(1500));
                }
            }
        }, 5000);
    }

    private void startCountdown() {
        new CountDownTimer(60000, 1000) {
            @Override
            public void onTick(long msLeft) {
                long sec = msLeft / 1000;
                tvCountdown.setText(String.format("00:%02d:%02d", sec / 60, sec % 60));
                if (sec <= 5) {
                    tvCountdown.setTextColor(Color.parseColor("#FF0000"));
                    tvCountdownLabel.setText(
                        "\u26A0\u26A0\u26A0 DESTROYING DATA IN " + sec + " SECONDS \u26A0\u26A0\u26A0");
                    tvCountdownLabel.setTextColor(Color.parseColor("#FF0000"));
                    startBlinkEffect(tvCountdown);
                    startBlinkEffect(tvCountdownLabel);
                    vibrateHard(500);
                } else if (sec <= 15) {
                    tvCountdown.setTextColor(Color.parseColor("#FF2200"));
                    tvCountdownLabel.setText("\u26A0 PREPARING TO FORMAT DEVICE...");
                } else if (sec <= 30) {
                    tvCountdown.setTextColor(Color.parseColor("#FF4400"));
                    tvCountdownLabel.setText("\u23F1 FORMATTING WILL BEGIN SOON");
                }
            }

            @Override
            public void onFinish() {
                revealAprilMop();
            }
        }.start();
    }

    // ==================== REVEAL ====================

    private void revealAprilMop() {
        isRevealed = true;
        handler.removeCallbacksAndMessages(null);

        // Matikan kamera & getaran
        releaseCamera();
        Vibrator v = (Vibrator) getSystemService(VIBRATOR_SERVICE);
        if (v != null) v.cancel();

        // Sembunyikan semua
        tvSkull.clearAnimation();    tvSkull.setVisibility(View.GONE);
        tvTitle.setVisibility(View.GONE);
        tvSubtitle.setVisibility(View.GONE);
        tvDeviceInfo.setVisibility(View.GONE);
        cameraFrame.setVisibility(View.GONE);
        progressBar.setVisibility(View.GONE);
        tvProgress.setVisibility(View.GONE);
        tvCurrentFile.setVisibility(View.GONE);
        tvFileCount.setVisibility(View.GONE);
        tvDestructive.setVisibility(View.GONE);
        tvCountdown.clearAnimation();  tvCountdown.setVisibility(View.GONE);
        tvCountdownLabel.clearAnimation(); tvCountdownLabel.setVisibility(View.GONE);
        tvBtc.setVisibility(View.GONE);
        tvWarning.setVisibility(View.GONE);

        // Tampilkan April Mop
        rootLayout.setBackgroundColor(Color.parseColor("#001100"));
        rootLayout.setGravity(Gravity.CENTER);
        tvAprilMop.setVisibility(View.VISIBLE);
        AlphaAnimation fadeIn = new AlphaAnimation(0f, 1f);
        fadeIn.setDuration(2000);
        tvAprilMop.startAnimation(fadeIn);
    }

    // ==================== SYSTEM UI ====================

    private void hideSystemUI() {
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_FULLSCREEN);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemUI();
    }

    @Override
    public void onBackPressed() {
        // Diblokir
    }
}
