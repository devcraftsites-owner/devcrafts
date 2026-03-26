public class PaddingTrimSample {

    public static void main(String[] args) {

        // ① ゼロ埋め
        int num = 42;
        System.out.println("ゼロ埋め5桁: " + String.format("%05d", num)); // 00042

        // ② 左揃え・右揃えパディング
        String name = "Java";
        System.out.println("右揃え: [" + String.format("%10s", name) + "]");  // [      Java]
        System.out.println("左揃え: [" + String.format("%-10s", name) + "]"); // [Java      ]

        // ③ 固定長レコード出力（帳票・バッチ処理）
        String record = String.format("%-10s%10d円", "りんご", 1500);
        System.out.println("固定長レコード: [" + record + "]");

        // ④ trim()：ASCII空白のみ除去（Java 6+）
        String withSpaces = "  Java  ";
        System.out.println("trim(): [" + withSpaces.trim() + "]"); // [Java]

        // ⑤ Java 11+: strip()：Unicode空白（全角スペース含む）も除去
        String withFullWidth = "\u3000Java\u3000"; // 全角スペース
        System.out.println("trim()（全角）: [" + withFullWidth.trim() + "]");   // [　Java　]（除去されない）
        System.out.println("strip()（全角）: [" + withFullWidth.strip() + "]"); // [Java]（Java 11+）

        // ⑥ Java 11+: stripLeading() / stripTrailing()
        String padded = "  Hello World  ";
        System.out.println("stripLeading():  [" + padded.stripLeading() + "]");  // [Hello World  ]
        System.out.println("stripTrailing(): [" + padded.stripTrailing() + "]"); // [  Hello World]

        // ⑦ 小数点フォーマット
        double pi = 3.14159265;
        System.out.println("小数2桁: " + String.format("%.2f", pi)); // 3.14

        // ⑧ Java 15+: テキストブロックでフォーマット文字列を整理
        String template = """
                %-10s %6.2f円
                """.strip();
        System.out.println(String.format(template, "バナナ", 150.0));
    }
}
