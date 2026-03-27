import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "dev-craft について — 運営方針と対象読者",
  description: "dev-craft は Java 実務レシピとブラウザ完結ツールを提供する開発者向けサイトです。現場で使えて、必要ならその先の理解にもつながる情報を積み重ねていく運営方針と、新人から中堅の開発者を主な対象とする読者層について説明します。",
  alternates: { canonical: "./" },
}

const sections = [
  {
    title: "このサイトを作っている理由",
    body: "現場で長く仕事をしていると、ちょっとした処理ひとつでも、案外きちんとまとまった情報が見つからないことがあります。サンプルはあるけれど実務にはそのまま使いにくい。解説はあるけれど、肝心な判断材料が足りない。そういう場面に何度も出会ってきました。",
  },
  {
    title: "残していきたいもの",
    body: "このサイトは、そうした経験から作っています。深く専門的に掘り下げるテーマだけでなく、広く浅い知識の中でも、業務の中で実際に使ったことのあるものはできるだけ残していきたいと考えています。まずは手元の仕事に使えること。そのうえで、必要になったときには理解を一段深めたり、次の学びにつなげたりできることを意識しています。",
  },
  {
    title: "届けたい相手",
    body: "新人の方や、中堅になって一通り任されることが増えてきた方が、困ったときに少しでも早く前に進めるように。気軽に引けて、必要ならもう一歩先までたどれる、そんな置き場になればと思っています。",
  },
]

export default function AboutPage() {
  return (
    <div className="docs-page">
      <section className="hero-panel hero-panel--compact">
        <div>
          <p className="eyebrow">About</p>
          <h1 className="hero-title hero-title--compact">dev-craft について</h1>
          <p className="hero-copy">
            現場で使えて、必要ならその先の理解やスキルアップにもつながる情報を、静かに積み重ねていくためのサイトです。
          </p>
        </div>
      </section>

      <article className="panel">
        <div className="info-page__sections">
          {sections.map((section) => (
            <section key={section.title} className="info-page__section">
              <h2 className="section-title">{section.title}</h2>
              <p className="section-copy">{section.body}</p>
            </section>
          ))}
        </div>
      </article>
    </div>
  )
}
