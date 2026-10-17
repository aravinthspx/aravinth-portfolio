import { useCallback, useState } from 'react'
import { motion } from 'motion/react'
import { formatDate, type Certificate } from '../content/certificates'
import { Dialog } from './Dialog'
import { ExternalIcon } from './ui'
import { spring } from '../lib/motion'

export function CertificateCard({ cert }: { cert: Certificate }) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const by = cert.issuer ? `${cert.provider} · via ${cert.issuer}` : cert.provider

  return (
    <motion.article
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-ink-2 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)]"
      whileHover={{ y: -6, rotate: -0.4 }}
      transition={spring}
    >
      {cert.thumb && (
        <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-cream/90">
          <img src={cert.thumb} alt="" loading="lazy" width={720} height={450} className="size-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-2/70 via-transparent" aria-hidden="true" />
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-cream backdrop-blur">{cert.kind}</span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-bold leading-tight text-cream">
          {cert.title}
          {cert.kind === 'Job simulation' && <span className="text-cream-2"> — Job Simulation</span>}
        </h3>
        <p className="mt-1 text-sm text-accent-2">{by}</p>
        <p className="mt-1 font-mono text-xs text-muted">
          Completed <time dateTime={cert.completed}>{formatDate(cert.completed)}</time>
        </p>
        {cert.topics && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Topics">
            {cert.topics.map((t) => (
              <li key={t} className="rounded-full bg-ink-3 px-2.5 py-1 text-[11px] text-cream-2">{t}</li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          {cert.file && (
            <motion.button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-full bg-cream px-4 py-2 text-xs font-semibold text-ink hover:bg-white cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              transition={spring}
            >
              View certificate<span className="sr-only">: {cert.title}</span>
            </motion.button>
          )}
          {cert.verifyUrl && (
            <a href={cert.verifyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-semibold text-cream hover:border-accent-2">
              Verify<span className="sr-only"> {cert.title} on {cert.provider} (opens in new tab)</span>
              <ExternalIcon className="size-3.5" />
            </a>
          )}
        </div>
      </div>

      {cert.file && (
        <Dialog open={open} onClose={close} title={`${cert.title} — ${by}`}>
          {open &&
            (cert.fileType === 'image' ? (
              <img src={cert.file} alt={`Certificate: ${cert.title}, issued by ${cert.provider}`} className="mx-auto w-full rounded-xl" />
            ) : (
              <object data={cert.file} type="application/pdf" className="h-[70dvh] w-full rounded-xl bg-white" aria-label={`Certificate PDF: ${cert.title}`}>
                {cert.thumb && <img src={cert.thumb} alt={`Certificate: ${cert.title}`} className="mx-auto w-full rounded-xl" />}
                <p className="mt-3 text-sm text-cream-2">Your browser can’t display PDFs inline.</p>
              </object>
            ))}
          <p className="mt-4 text-sm">
            <a href={cert.file} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-accent-2 underline underline-offset-4 hover:text-cream">
              Open the original file <ExternalIcon className="size-3.5" />
            </a>
          </p>
        </Dialog>
      )}
    </motion.article>
  )
}
