import Link from 'next/link'

interface Category {
  id: number
  name: string
  icon: string
  count: number
  description: string
}

interface CategoryGridProps {
  categories: Category[]
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/media?category=${encodeURIComponent(category.name)}`}
          className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/20"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="text-4xl">{category.icon}</div>
            <span className="text-sm font-semibold text-primary bg-blue-50 px-3 py-1 rounded-full">
              {category.count}+资源
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          
          <p className="text-gray-600 mb-4">
            {category.description}
          </p>
          
          <div className="text-primary font-semibold flex items-center group-hover:translate-x-1 transition-transform">
            查看资源 →
          </div>
        </Link>
      ))}
    </div>
  )
}
