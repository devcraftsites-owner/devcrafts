import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.NoSuchElementException;

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

    // Java 17: record でページ情報をシンプルに表現する
    record Page<T>(int pageNumber, List<T> items, boolean hasNext) {}

    // ページング機能付きデータストア
    static class PagedDataStore<T> extends DataStore<T> {
        private final int pageSize;

        public PagedDataStore(int pageSize) {
            this.pageSize = pageSize;
        }

        // 指定ページの要素を Page record で返す（Java 17+）
        public Page<T> getPage(int pageNumber) {
            int start = pageNumber * pageSize;
            int end = Math.min(start + pageSize, size());
            List<T> pageItems = new ArrayList<>();
            var all = iterator(); // var でローカル変数の型推論（Java 17+）
            int idx = 0;
            while (all.hasNext()) {
                T item = all.next();
                if (idx >= start && idx < end) {
                    pageItems.add(item);
                }
                idx++;
            }
            boolean hasNext = end < size();
            return new Page<>(pageNumber, pageItems, hasNext);
        }

        // 指定ページのイテレータを返す
        public Iterator<T> pageIterator(int pageNumber) {
            return getPage(pageNumber).items().iterator();
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Iterator パターン: カスタムコレクションのイテレータ（Java 17）===");

        var store = new DataStore<String>(); // var でローカル変数の型推論（Java 17+）
        store.add("Apple");
        store.add("Banana");
        store.add("Cherry");
        store.add("Date");
        store.add("Elderberry");

        System.out.println("--- for-each ループで全要素を走査 ---");
        for (var item : store) {
            System.out.println("  " + item);
        }

        System.out.println("\n--- PagedDataStore + Page record（Java 17）---");
        var pagedStore = new PagedDataStore<String>(2);
        pagedStore.add("Page1-A");
        pagedStore.add("Page1-B");
        pagedStore.add("Page2-A");
        pagedStore.add("Page2-B");
        pagedStore.add("Page3-A");

        int pageNum = 0;
        Page<String> page;
        do {
            page = pagedStore.getPage(pageNum);
            // record のコンポーネントアクセスで pageNumber, items, hasNext を取得する
            System.out.println("ページ " + page.pageNumber() + " (次のページあり: " + page.hasNext() + "): " + page.items());
            pageNum++;
        } while (page.hasNext());

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
