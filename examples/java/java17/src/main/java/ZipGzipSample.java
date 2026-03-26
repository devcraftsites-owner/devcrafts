import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.*;

public class ZipGzipSample {

    // ZIP エントリを表す record（ZipEntry という名前は java.util.zip.ZipEntry と衝突するため別名を使用）
    record ZipEntryData(String name, String content) {}

    // 複数エントリを1つの ZIP に圧縮
    public static byte[] createZip(List<ZipEntryData> entries) throws IOException {
        var baos = new ByteArrayOutputStream();
        try (var zos = new ZipOutputStream(baos)) {
            for (var entry : entries) {
                zos.putNextEntry(new ZipEntry(entry.name()));
                zos.write(entry.content().getBytes(StandardCharsets.UTF_8));
                zos.closeEntry(); // 忘れると ZIP が壊れるので必須
            }
        }
        return baos.toByteArray();
    }

    // ZIP を展開して List<ZipEntryData> として返す
    public static List<ZipEntryData> readZip(byte[] zipData) throws IOException {
        var result = new ArrayList<ZipEntryData>();
        try (var zis = new ZipInputStream(new ByteArrayInputStream(zipData))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                var content = new ByteArrayOutputStream();
                var buffer = new byte[1024];
                int len;
                while ((len = zis.read(buffer)) != -1) {
                    content.write(buffer, 0, len);
                }
                result.add(new ZipEntryData(entry.getName(), content.toString("UTF-8")));
                zis.closeEntry();
            }
        }
        return result;
    }

    // 単一データを GZIP 圧縮
    public static byte[] gzipCompress(String text) throws IOException {
        var baos = new ByteArrayOutputStream();
        try (var gos = new GZIPOutputStream(baos)) {
            gos.write(text.getBytes(StandardCharsets.UTF_8));
        }
        return baos.toByteArray();
    }

    // GZIP 解凍
    public static String gzipDecompress(byte[] compressed) throws IOException {
        var bais = new ByteArrayInputStream(compressed);
        var baos = new ByteArrayOutputStream();
        try (var gis = new GZIPInputStream(bais)) {
            var buffer = new byte[1024];
            int len;
            while ((len = gis.read(buffer)) != -1) {
                baos.write(buffer, 0, len);
            }
        }
        return baos.toString("UTF-8");
    }

    public static void main(String[] args) throws Exception {
        // ZIP デモ（record を使ったリスト）
        System.out.println("=== ZIP 圧縮・解凍 ===");
        var entries = List.of(
                new ZipEntryData("hello.txt", "Hello, World!\n日本語テスト"),
                new ZipEntryData("data.csv", "id,name\n1,田中\n2,鈴木")
        );
        var zip = createZip(entries);
        System.out.println("ZIP サイズ: " + zip.length + " bytes");

        var extracted = readZip(zip);
        extracted.forEach(e -> {
            System.out.println("ファイル: " + e.name());
            System.out.println("内容: " + e.content());
        });

        // GZIP デモ
        System.out.println("\n=== GZIP 圧縮・解凍 ===");
        var text = "GZIP 圧縮テスト。同じ文字列が繰り返されると圧縮率が高くなります。".repeat(10);
        var compressed = gzipCompress(text);
        var originalSize = text.getBytes(StandardCharsets.UTF_8).length;
        System.out.printf("元サイズ: %d bytes → 圧縮後: %d bytes (%.1f%%圧縮)%n",
                originalSize, compressed.length,
                (1.0 - (double) compressed.length / originalSize) * 100);
        var decompressed = gzipDecompress(compressed);
        System.out.println("解凍後一致: " + text.equals(decompressed));

        // テキストブロックを使った結果表示（Java 15+）
        var summary = """
                === 圧縮サマリー ===
                ZIP エントリ数: %d
                GZIP 元サイズ: %d bytes
                GZIP 圧縮後: %d bytes
                """.formatted(entries.size(), originalSize, compressed.length);
        System.out.println(summary);
    }
}
