import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.function.Predicate;

public class IteratorPatternSample {

    // 汎用データストア: 内部のリスト構造を隠してイテレータを提供する
    static class DataStore<T> implements Iterable<T> {
        private final List<T> items = new ArrayList<>();

        public void add(T item) {
            items.add(item);
        }

        public int size() {
            return items.size();
        }

        public List<T> getItems() {
            return new ArrayList<>(items);
        }

        @Override
        public Iterator<T> iterator() {
            return new DataStoreIterator<>(items);
        }
    }

    // DataStore 専用のイテレータ実装
    static class DataStoreIterator<T> implements Iterator<T> {
        private final List<T> items;
        private int currentIndex = 0;

        public DataStoreIterator(List<T> items) {
            this.items = items;
        }

        @Override
        public boolean hasNext() {
            return currentIndex < items.size();
        }

        @Override
        public T next() {
            if (!hasNext()) {
                throw new NoSuchElementException("これ以上要素がありません (index=" + currentIndex + ")");
            }
            return items.get(currentIndex++);
        }
    }

    // Java 17+: record でページ情報を表現する
    record Page<T>(int pageNumber, List<T> items, boolean hasNext) {}

    // Java 21: sealed interface でイテレーション戦略を型安全に表現する
    sealed interface IterationStrategy
            permits IterationStrategy.Sequential, IterationStrategy.Paged, IterationStrategy.Filtered {
        // 全要素を順番に取得する戦略
        record Sequential() implements IterationStrategy {}
        // ページ単位で取得する戦略
        record Paged(int pageSize) implements IterationStrategy {}
        // 条件に一致する要素だけを取得する戦略
        record Filtered(Predicate<Object> predicate) implements IterationStrategy {}
    }

    // switch パターンマッチングで戦略に応じたイテレータを生成する（Java 21+）
    @SuppressWarnings("unchecked")
    static Iterator<String> createIterator(List<String> data, IterationStrategy strategy) {
        return switch (strategy) {
            case IterationStrategy.Sequential() -> {
                // 全要素を返すイテレータ
                yield new DataStoreIterator<>(data);
            }
            case IterationStrategy.Paged(int pageSize) -> {
                // 最初のページ（0ページ目）のイテレータを返す
                int end = Math.min(pageSize, data.size());
                yield new DataStoreIterator<>(data.subList(0, end));
            }
            case IterationStrategy.Filtered(Predicate<Object> predicate) -> {
                // 条件に一致する要素だけのリストを作ってイテレータを返す
                List<String> filtered = new ArrayList<>();
                for (String item : data) {
                    if (predicate.test(item)) {
                        filtered.add(item);
                    }
                }
                yield new DataStoreIterator<>(filtered);
            }
        };
    }

    public static void main(String[] args) {
        System.out.println("=== Iterator パターン: カスタムコレクションのイテレータ（Java 21）===");

        var store = new DataStore<String>();
        store.add("Apple");
        store.add("Banana");
        store.add("Cherry");
        store.add("Date");
        store.add("Elderberry");

        System.out.println("--- for-each ループで全要素を走査 ---");
        for (var item : store) {
            System.out.println("  " + item);
        }

        System.out.println("\n--- sealed interface + switch パターンマッチング（Java 21+）---");
        var data = store.getItems();

        // Sequential: 全要素を順番に取得する
        System.out.println("Sequential 戦略:");
        var seqIt = createIterator(data, new IterationStrategy.Sequential());
        while (seqIt.hasNext()) {
            System.out.println("  " + seqIt.next());
        }

        // Paged: 最初の2件を取得する
        System.out.println("Paged 戦略（pageSize=2）:");
        var pagedIt = createIterator(data, new IterationStrategy.Paged(2));
        while (pagedIt.hasNext()) {
            System.out.println("  " + pagedIt.next());
        }

        // Filtered: "a" を含む要素だけを取得する（大文字小文字無視）
        System.out.println("Filtered 戦略（'a' を含む）:");
        Predicate<Object> containsA = item -> item.toString().toLowerCase().contains("a");
        var filteredIt = createIterator(data, new IterationStrategy.Filtered(containsA));
        while (filteredIt.hasNext()) {
            System.out.println("  " + filteredIt.next());
        }

        System.out.println("\n--- 空のコレクションで hasNext() を確認 ---");
        var empty = new DataStore<String>();
        var emptyIt = empty.iterator();
        System.out.println("空コレクションの hasNext(): " + emptyIt.hasNext());

        System.out.println("\n--- NoSuchElementException のデモ ---");
        var small = new DataStore<String>();
        small.add("only one");
        var smallIt = small.iterator();
        System.out.println("1件目: " + smallIt.next());
        try {
            smallIt.next();
        } catch (NoSuchElementException e) {
            System.out.println("例外発生: " + e.getMessage());
        }
    }
}
