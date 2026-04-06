# ============================================
# ProGuard / R8 — Obfuscation Rules
# Tujuan: Membuat source code tidak bisa dibaca
# setelah di-decompile dengan jadx/apktool
# ============================================

# Obfuscate semua kode secara agresif
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-dontpreverify
-verbose

# Rename semua ke a, b, c, dll
-repackageclasses ''
-allowaccessmodification
-overloadaggressively

# Hapus semua log & debug info
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}

# Hapus info source file & line number (biar stack trace juga acak)
-renamesourcefileattribute SourceFile
-keepattributes SourceFile,LineNumberTable

# Hapus nama method dari exception
-keepattributes Exceptions

# Keep hanya Activity entry point (wajib agar Android bisa jalankan)
-keep public class com.prank.app.MainActivity {
    public void onCreate(android.os.Bundle);
}

# Keep resource references
-keepclassmembers class **.R$* {
    public static <fields>;
}

# Obfuscate dictionary — pakai karakter random huruf kecil
-obfuscationdictionary proguard-dict.txt
-classobfuscationdictionary proguard-dict.txt
-packageobfuscationdictionary proguard-dict.txt
