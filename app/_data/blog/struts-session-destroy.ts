import type { BlogArticle } from "./types"

export const article: BlogArticle = {
  slug: "struts1-singleton-action-session-destroy",
  title: "Struts1で誰かがログアウトすると全員ログアウトされる",
  description:
    "Struts1のActionがシングルトンだと知らずにフィールドにサービスを持たせた結果、1人のログアウトで全ユーザーのセッションが破棄された話。",
  publishedAt: "2026-05-01",
  tags: ["Struts1", "シングルトン", "スレッドセーフ", "セッション", "トラブルシューティング"],
  relatedArticleSlugs: ["singleton-pattern", "synchronized-basics", "thread-local", "thread-basics"],
  relatedToolSlugs: [],

  symptom: `本番環境で「急にログアウトされた」という問い合わせが複数ユーザーから同時に来たんですよね。最初は「セッションタイムアウトかな？」と思ったんだけど、タイミングが揃いすぎている。調べてみると、特定のタイミングで全ユーザーのセッションが一斉に破棄されて、全員が強制ログアウトされていた。毎回起きるわけではなく、誰かがログアウト操作をしたタイミングで発生しているっぽい。でもログアウト処理は自分のセッションだけ消すはずなのに、なぜ全員巻き込まれるのか全然分からなかった。`,

  environment: "Struts 1 / Apache Tomcat",

  wrongApproach: `まずアクセスログを確認してみたけど、特殊なリクエストは飛んでいない。普通のログアウトリクエストが1件あるだけ。次にアプリケーションログを時系列で追いかけてみると、あるユーザーがログアウトした直後に、他の全ユーザーのセッションが破棄されていることが分かった。「1人がログアウトすると全員道連れ」という状況。ログアウト処理のコードを見ても、session.invalidate() を呼んでいるだけで、他のユーザーのセッションに触っている箇所は見当たらない。ここで結構ハマりました。`,

  rootCause: `原因は Struts 1 の Action クラスがシングルトンだということを理解していなかったこと。Struts 1 では Action のインスタンスはアプリケーション全体で1つしか作られない。つまり全リクエストが同じインスタンスを共有する。問題のコードでは、セッション破棄処理を行うサービスクラスを Action のインスタンスフィールドに持たせていた。このサービスが内部に状態（処理対象のユーザー情報）を保持していたため、あるユーザーのログアウトリクエストでセットされた状態が、別のユーザーのリクエストでもそのまま使われてしまった。さらにセッション削除処理のユーザー判定ロジックにもバグがあり、条件に合致する全セッションを消してしまっていた。シングルトンの共有状態 + ユーザー判定バグ の合わせ技で、1人のログアウトが全員に波及していた。`,

  solution: `サービスクラスを Action のフィールドから外し、execute メソッド内でローカル変数として生成するように変更した。これでリクエストごとに独立したインスタンスが使われるようになり、他のユーザーの状態と混ざることがなくなった。あわせてセッション削除処理のユーザー判定ロジックも修正し、自分のセッションだけを対象にするようにした。`,

  solutionCode: `// 修正前: Action のフィールドにサービスを保持（全リクエストで共有される）
public class LogoutAction extends Action {
    private SessionService sessionService = new SessionService(); // 危険！

    public ActionForward execute(...) {
        sessionService.setUser(currentUser);  // 別リクエストに上書きされる
        sessionService.destroySession();
        return mapping.findForward("login");
    }
}

// 修正後: メソッド内のローカル変数にする（リクエストごとに独立）
public class LogoutAction extends Action {

    public ActionForward execute(...) {
        SessionService sessionService = new SessionService(); // リクエストスコープ
        sessionService.destroySession(request.getSession());  // 自分のセッションだけ渡す
        return mapping.findForward("login");
    }
}`,

  prevention: `Struts 1 の Action はシングルトンでスレッドアンセーフ。これは公式ドキュメントにも書いてあるんだけど、意外と知らない人が多い。Action にインスタンスフィールドを持たせると、全リクエストで状態が共有されてしまう。状態はすべてメソッドのローカル変数か、HttpServletRequest / HttpSession に持たせるのが鉄則。Spring の Controller（デフォルトでシングルトン）でも同じ話なので、フレームワークのスコープは最初に確認しておくのが大事です。`,

  searchKeywords: [
    "Struts Action シングルトン",
    "Struts セッション 全員 ログアウト",
    "Struts1 スレッドセーフ",
    "Struts Action フィールド 危険",
    "Java セッション 勝手に切れる",
    "Servlet シングルトン スレッド",
    "Struts1 Action instance variable",
  ],

  faq: [
    {
      question: "Struts 1 の Action がシングルトンだと何が問題なの？",
      answer:
        "全リクエストが同じインスタンスを共有するので、インスタンスフィールドに状態を持つと別のリクエストと値が混ざります。ログイン中のユーザー情報が他人に見えるなどの重大なバグにつながります。",
    },
    {
      question: "Spring の Controller でも同じ問題が起きる？",
      answer:
        "はい。Spring の Controller もデフォルトでシングルトンなので、フィールドにリクエスト固有の状態を持たせると同じ問題が起きます。@Scope(\"prototype\") にするか、ローカル変数で処理するのが安全です。",
    },
    {
      question: "シングルトンの Action で安全に状態を扱うにはどうすればいい？",
      answer:
        "メソッドのローカル変数、HttpServletRequest の属性、HttpSession のいずれかに状態を持たせます。インスタンスフィールドにはステートレスなユーティリティやDAO以外を置かないのが鉄則です。",
    },
  ],
}
