public class PaddingTrimSample {

    public static void main(String[] args) {

        // ① ゼロ埋め
        int num = 42;
        System.out.println("ゼロ埋め5桁: " + String.format("%05d", num)); // 00042

        // ② 左揃え・右揃えパディング
        String name = "Java";
        System.out.println("右揃え: [" + String.format("%10s", name) + "]");
        System.out.println("左揃え: [" + String.format("%-10s", name) + "]");

        // ③ 固定長レコード出力
        String record = String.format("%-10s%10d円", "りんご", 1500);
        System.out.println("固定長レコード: [" + record + "]");

        // ④ trim()：ASCII空白のみ
        System.out.println("trim(): [" + "  Java  ".trim() + "]");

        // ⑤ Java 11+: strip()：Unicode空白（全角スペース含む）も除去
        String withFullWidth = "\u3000Java\u3000";
        System.out.println("trim()（全角）: [" + withFullWidth.trim() + "]");   // 除去されない
        System.out.println("strip()（全角）: [" + withFullWidth.strip() + "]"); // Java 11+

        // ⑥ Java 11+: stripLeading() / stripTrailing()
        String padded = "  Hello World  ";
        System.out.println("stripLeading():  [" + padded.stripLeading() + "]");
        System.out.println("stripTrailing(): [" + padded.stripTrailing() + "]");

        // ⑦ 小数点フォーマット
        System.out.println("小数2桁: " + String.format("%.2f", 3.14159));

        // ⑧ Java 21: String Templates の代わりに formatted() で読みやすく書く（Java 15+）
        String result = "%-10s %6.2f円".formatted("バナナ", 150.0); // Java 15+
        System.out.println(result);

        // ⑨ 手動ゼロ埋め（repeat を使った例）
        String numStr = String.valueOf(num);
        String zeroPadded = "0".repeat(Math.max(0, 5 - numStr.length())) + numStr; // Java 11+
        System.out.println("repeat でゼロ埋め: " + zeroPadded); // 00042
    }
}
