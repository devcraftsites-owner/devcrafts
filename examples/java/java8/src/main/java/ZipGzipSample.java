import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.zip.*;

public class ZipGzipSample {

    // 複数エントリを1つの ZIP に圧縮
    public static byte[] createZip(String[] fileNames, String[] contents) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            for (int i = 0; i < fileNames.length; i++) {
                ZipEntry entry = new ZipEntry(fileNames[i]);
                zos.putNextEntry(entry);
                zos.write(contents[i].getBytes(StandardCharsets.UTF_8));
                zos.closeEntry(); // 忘れると ZIP が壊れるので必須
            }
        }
        return baos.toByteArray();
    }

    // ZIP を展開してエントリ一覧と内容を取得
    public static void readZip(byte[] zipData) throws IOException {
        try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(zipData))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                ByteArrayOutputStream content = new ByteArrayOutputStream();
                byte[] buffer = new byte[1024];
                int len;
                while ((len = zis.read(buffer)) != -1) {
                    content.write(buffer, 0, len);
                }
                System.out.println("ファイル: " + entry.getName()
                        + " (圧縮後: " + entry.getCompressedSize() + " bytes)");
                System.out.println("内容: " + content.toString("UTF-8"));
                zis.closeEntry();
            }
        }
    }

    // 単一データを GZIP 圧縮
    public static byte[] gzipCompress(String text) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (GZIPOutputStream gos = new GZIPOutputStream(baos)) {
            gos.write(text.getBytes(StandardCharsets.UTF_8));
        }
        return baos.toByteArray();
    }

    // GZIP 解凍
    public static String gzipDecompress(byte[] compressed) throws IOException {
        ByteArrayInputStream bais = new ByteArrayInputStream(compressed);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (GZIPInputStream gis = new GZIPInputStream(bais)) {
            byte[] buffer = new byte[1024];
            int len;
            while ((len = gis.read(buffer)) != -1) {
                baos.write(buffer, 0, len);
            }
        }
        return baos.toString("UTF-8");
    }

    public static void main(String[] args) throws Exception {
        // ZIP デモ
        System.out.println("=== ZIP 圧縮・解凍 ===");
        String[] names = {"hello.txt", "data.csv"};
        String[] contents = {"Hello, World!\n日本語テスト", "id,name\n1,田中\n2,鈴木"};
        byte[] zip = createZip(names, contents);
        System.out.println("ZIP サイズ: " + zip.length + " bytes");
        readZip(zip);

        // GZIP デモ
        System.out.println("\n=== GZIP 圧縮・解凍 ===");
        String text = "GZIP 圧縮テスト。同じ文字列が繰り返されると圧縮率が高くなります。";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            sb.append(text);
        }
        String repeated = sb.toString();
        byte[] compressed = gzipCompress(repeated);
        int originalSize = repeated.getBytes(StandardCharsets.UTF_8).length;
        System.out.printf("元サイズ: %d bytes → 圧縮後: %d bytes (%.1f%%圧縮)%n",
                originalSize, compressed.length,
                (1.0 - (double) compressed.length / originalSize) * 100);
        String decompressed = gzipDecompress(compressed);
        System.out.println("解凍後一致: " + repeated.equals(decompressed));
    }
}
