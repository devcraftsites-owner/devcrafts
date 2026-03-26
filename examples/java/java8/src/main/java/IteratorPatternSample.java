import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.NoSuchElementException;

public class IteratorPatternSample {

    // 汎用データストア: 内部のリスト構造を隠してイテレータを提供する
    static class DataStore<T> implements Iterable<T> {
        private final List<T> items = new ArrayList<T>();

        // 要素を追加する
        public void add(T item) {
            items.add(item);
        }

        // 要素数を返す
        public int size() {
            return items.size();
        }

        // Iterable を実装することで for-each ループが使えるようになる
        @Override
        public Iterator<T> iterator() {
            return new DataStoreIterator<T>(items);
        }
    }

    // DataStore 専用のイテレータ実装
    static class DataStoreIterator<T> implements Iterator<T> {
        private final List<T> items;
        private int currentIndex = 0; // 現在の走査位置

        public DataStoreIterator(List<T> items) {
            this.items = items;
        }

        // 次の要素があるかどうかを返す
        @Override
        public boolean hasNext() {
            return currentIndex < items.size();
        }

        // 次の要素を返し、カーソルを進める
        @Override
        public T next() {
            if (!hasNext()) {
                // hasNext() を確認せずに next() を呼ぶと NoSuchElementException が発生する
                throw new NoSuchElementException("これ以上要素がありません (index=" + currentIndex + ")");
            }
            return items.get(currentIndex++);
        }
    }

    // ページング機能付きデータストア: DataStore を継承して pageIterator を追加する
    static class PagedDataStore<T> extends DataStore<T> {
        private final int pageSize; // 1ページあたりの件数

        public PagedDataStore(int pageSize) {
            this.pageSize = pageSize;
        }

        // 指定ページ（0始まり）の要素だけをイテレートするイテレータを返す
        public Iterator<T> pageIterator(int page) {
            // このページの開始・終了インデックスを計算する
            int start = page * pageSize;
            int end = Math.min(start + pageSize, size());
            // 対象ページの要素だけを取り出してイテレータに渡す
            List<T> pageItems = new ArrayList<T>();
            Iterator<T> all = iterator();
            int idx = 0;
            while (all.hasNext()) {
                T item = all.next();
                if (idx >= start && idx < end) {
                    pageItems.add(item);
                }
                idx++;
            }
            return new DataStoreIterator<T>(pageItems);
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Iterator パターン: カスタムコレクションのイテレータ ===");

        // DataStore に要素を追加する
        DataStore<String> store = new DataStore<String>();
        store.add("Apple");
        store.add("Banana");
        store.add("Cherry");
        store.add("Date");
        store.add("Elderberry");

        System.out.println("--- for-each ループで全要素を走査 ---");
        // Iterable を実装しているので for-each ループが使える
        for (String item : store) {
            System.out.println("  " + item);
        }

        System.out.println("\n--- Iterator を直接使って走査 ---");
        Iterator<String> it = store.iterator();
        while (it.hasNext()) {
            // hasNext() で確認してから next() を呼ぶのが基本
            System.out.println("  " + it.next());
        }

        System.out.println("\n--- PagedDataStore: ページ単位で走査 ---");
        PagedDataStore<String> pagedStore = new PagedDataStore<String>(2);
        pagedStore.add("Page1-A");
        pagedStore.add("Page1-B");
        pagedStore.add("Page2-A");
        pagedStore.add("Page2-B");
        pagedStore.add("Page3-A");

        for (int page = 0; page * 2 < pagedStore.size(); page++) {
            System.out.println("ページ " + page + ":");
            Iterator<String> pageIt = pagedStore.pageIterator(page);
            while (pageIt.hasNext()) {
                System.out.println("  " + pageIt.next());
            }
        }

        System.out.println("\n--- 空のコレクションで hasNext() を確認 ---");
        DataStore<String> empty = new DataStore<String>();
        Iterator<String> emptyIt = empty.iterator();
        System.out.println("空コレクションの hasNext(): " + emptyIt.hasNext()); // false

        System.out.println("\n--- NoSuchElementException のデモ ---");
        DataStore<String> small = new DataStore<String>();
        small.add("only one");
        Iterator<String> smallIt = small.iterator();
        System.out.println("1件目: " + smallIt.next());
        try {
            // hasNext() を確認せずに next() を呼ぶと例外が発生する
            smallIt.next();
        } catch (NoSuchElementException e) {
            System.out.println("例外発生: " + e.getMessage());
        }
    }
}
