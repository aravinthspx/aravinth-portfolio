import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { blogPosts } from '../content/records'
import { getProject } from '../content/projects'
import { formatDate } from '../content/certificates'
import { SITE_TITLE } from '../lib/meta'
import { ArrowIcon } from '../components/ui'
import NotFound from './NotFound'

/** A single blog post from src/content/records.ts — `/blog/:slug`. */
export default function BlogPost() {
  const { slug } = useParams()
  const post = blogPosts.find((p) => p.slug === slug)

  useEffect(() => {
    if (post) document.title = `${post.title} | Aravinth M`
    return () => {
      document.title = SITE_TITLE
    }
  }, [post])

  if (!post) return <NotFound />
  const related = post.relatedProject ? getProject(post.relatedProject) : undefined

  return (
    <article className="container-x pb-24 pt-28 md:pt-36">
      <div className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted">
          <Link to={{ pathname: '/', hash: '#blog' }} className="hover:text-cream">← All posts</Link>
        </nav>
        <p className="font-mono text-xs text-muted">
          <span className="text-accent">{post.category}</span> · <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingMinutes} min read
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-cream sm:text-4xl md:text-5xl">{post.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-cream-2">{post.summary}</p>
        {post.cover && <img src={post.cover} alt="" className="mt-10 w-full rounded-3xl border border-line" />}
        <div className="mt-10 space-y-5 text-[17px] leading-relaxed text-cream-2">
          {post.content.map((para, i) =>
            para.startsWith('## ') ? (
              <h2 key={i} className="pt-4 font-display text-2xl font-bold text-cream">
                {para.slice(3)}
              </h2>
            ) : (
              <p key={i}>{para}</p>
            ),
          )}
        </div>
        {related && (
          <Link to={`/work/${related.slug}`} className="panel mt-12 flex items-center justify-between gap-4 rounded-2xl p-5 transition-colors hover:border-accent/40">
            <span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Related project</span>
              <span className="mt-1 block font-display text-lg font-bold text-cream">{related.name}</span>
            </span>
            <ArrowIcon className="size-5 text-accent" />
          </Link>
        )}
      </div>
    </article>
  )
}
