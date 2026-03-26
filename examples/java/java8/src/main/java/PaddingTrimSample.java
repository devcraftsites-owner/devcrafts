public class PaddingTrimSample {

    public static void main(String[] args) {

        // ① ゼロ埋め（数値を固定桁数に揃える）
        int num = 42;
        String zeroPadded = String.format("%05d", num); // 5桁ゼロ埋め
        System.out.println("ゼロ埋め5桁: " + zeroPadded); // 00042

        // ② 左揃え・右揃えパディング（文字列）
        String name = "Java";
        String rightAlign = String.format("%10s", name);  // 右揃え10桁
        String leftAlign  = String.format("%-10s", name); // 左揃え10桁
        System.out.println("右揃え: [" + rightAlign + "]"); // [      Java]
        System.out.println("左揃え: [" + leftAlign  + "]"); // [Java      ]

        // ③ 数値の右揃え（固定長レコード出力）
        int price = 1500;
        String record = String.format("%-10s%10d円", "りんご", price);
        System.out.println("固定長レコード: [" + record + "]"); // [りんご       1500円]

        // ④ trim()：ASCII空白（半角スペース・タブ・改行）を除去
        String withSpaces = "  Java  ";
        System.out.println("trim(): [" + withSpaces.trim() + "]"); // [Java]

        // ⑤ trim() は全角スペースを除去しない点に注意（Java 8）
        String withFullWidth = "\u3000Java\u3000"; // 全角スペース
        System.out.println("trim()（全角）: [" + withFullWidth.trim() + "]"); // [　Java　]（除去されない）

        // Java 8 で全角スペースも除去するには replace() を使う
        String trimmedFull = withFullWidth.replace("\u3000", "").trim();
        System.out.println("replace後trim(): [" + trimmedFull + "]"); // [Java]

        // ⑥ String.format での小数点桁数指定
        double pi = 3.14159265;
        System.out.println("小数2桁: " + String.format("%.2f", pi)); // 3.14
        System.out.println("合計8桁小数2桁: " + String.format("%8.2f", pi)); // "    3.14"

        // ⑦ 手動でゼロ埋め（StringBuilder を使う方法）
        StringBuilder sb = new StringBuilder(String.valueOf(num));
        while (sb.length() < 5) {
            sb.insert(0, '0');
        }
        System.out.println("手動ゼロ埋め: " + sb.toString()); // 00042
    }
}
