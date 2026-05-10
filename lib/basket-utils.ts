// lib/basket-utils.ts - 投放篮工具函数

export interface BasketItem {
  id: number
  name: string
  city: string
  category: string
  dealPrice: number
  listPrice: number
  image: string
  quantity: number
  duration: number
}

const BASKET_KEY = 'advertising-basket'

// 获取投放篮中的所有项目
export function getBasketItems(): BasketItem[] {
  if (typeof window === 'undefined') return []
  
  try {
    const saved = localStorage.getItem(BASKET_KEY)
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error('获取投放篮失败:', error)
    return []
  }
}

// 添加项目到投放篮
export function addToBasket(item: Omit<BasketItem, 'quantity' | 'duration'>): boolean {
  try {
    const items = getBasketItems()
    
    // 检查是否已存在
    const existingIndex = items.findIndex(i => i.id === item.id)
    
    if (existingIndex >= 0) {
      // 已存在，增加数量
      items[existingIndex].quantity += 1
    } else {
      // 新项目，设置默认值
      items.push({
        ...item,
        quantity: 1,
        duration: 3 // 默认3个月
      })
    }
    
    localStorage.setItem(BASKET_KEY, JSON.stringify(items))
    return true
  } catch (error) {
    console.error('添加到投放篮失败:', error)
    return false
  }
}

// 从投放篮移除项目
export function removeFromBasket(itemId: number): boolean {
  try {
    const items = getBasketItems()
    const filtered = items.filter(item => item.id !== itemId)
    localStorage.setItem(BASKET_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('从投放篮移除失败:', error)
    return false
  }
}

// 更新项目数量
export function updateQuantity(itemId: number, quantity: number): boolean {
  if (quantity < 1) {
    return removeFromBasket(itemId)
  }
  
  try {
    const items = getBasketItems()
    const updated = items.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    )
    localStorage.setItem(BASKET_KEY, JSON.stringify(updated))
    return true
  } catch (error) {
    console.error('更新数量失败:', error)
    return false
  }
}

// 更新投放周期
export function updateDuration(itemId: number, duration: number): boolean {
  if (duration < 1) duration = 1
  if (duration > 12) duration = 12
  
  try {
    const items = getBasketItems()
    const updated = items.map(item => 
      item.id === itemId ? { ...item, duration } : item
    )
    localStorage.setItem(BASKET_KEY, JSON.stringify(updated))
    return true
  } catch (error) {
    console.error('更新投放周期失败:', error)
    return false
  }
}

// 清空投放篮
export function clearBasket(): boolean {
  try {
    localStorage.removeItem(BASKET_KEY)
    return true
  } catch (error) {
    console.error('清空投放篮失败:', error)
    return false
  }
}

// 获取投放篮项目数量
export function getBasketCount(): number {
  const items = getBasketItems()
  return items.reduce((total, item) => total + item.quantity, 0)
}

// 计算总价
export function calculateTotal(): number {
  const items = getBasketItems()
  return items.reduce((total, item) => {
    return total + (item.dealPrice * item.quantity * item.duration)
  }, 0)
}

// 检查项目是否在投放篮中
export function isInBasket(itemId: number): boolean {
  const items = getBasketItems()
  return items.some(item => item.id === itemId)
}