'use client'

interface ProductDescriptionProps {
  description: string
}

export default function ProductDescription({
  description,
}: ProductDescriptionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Description</h2>
      <p className="text-lg leading-relaxed text-foreground">
        {description || 'No description available for this product.'}
      </p>
    </section>
  )
}


