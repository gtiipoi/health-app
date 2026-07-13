// Comprehensive Chinese food nutrition database
// Values per 100g unless otherwise noted

export interface FoodItem {
  name: string;
  category: string;
  calories: number; // kcal per 100g
  protein: number; // g per 100g
  carbs: number; // g per 100g
  fat: number; // g per 100g
  fiber?: number; // g per 100g
}

export const foodCategories: Record<string, string> = {
  staple: '主食',
  meat: '肉类',
  seafood: '海鲜',
  egg_dairy: '蛋奶',
  vegetable: '蔬菜',
  fruit: '水果',
  snack: '零食',
  drink: '饮品',
  condiment: '调味料',
  fast_food: '快餐',
  soup: '汤羹',
  bean: '豆类',
};

export const foodDatabase: FoodItem[] = [
  // ===== 主食 (Staple Foods) =====
  { name: '白米饭', category: 'staple', calories: 116, protein: 2.6, carbs: 25.9, fat: 0.3, fiber: 0.3 },
  { name: '糙米饭', category: 'staple', calories: 123, protein: 2.7, carbs: 25.6, fat: 1.0, fiber: 1.8 },
  { name: '白粥', category: 'staple', calories: 46, protein: 1.1, carbs: 9.7, fat: 0.1, fiber: 0.1 },
  { name: '小米粥', category: 'staple', calories: 46, protein: 1.4, carbs: 8.4, fat: 0.7, fiber: 0.5 },
  { name: '馒头', category: 'staple', calories: 223, protein: 7.0, carbs: 44.2, fat: 1.1, fiber: 1.3 },
  { name: '花卷', category: 'staple', calories: 211, protein: 6.4, carbs: 42.0, fat: 1.1 },
  { name: '包子（猪肉）', category: 'staple', calories: 226, protein: 8.1, carbs: 28.6, fat: 8.0, fiber: 1.0 },
  { name: '饺子（猪肉白菜）', category: 'staple', calories: 218, protein: 8.2, carbs: 27.4, fat: 7.8, fiber: 0.8 },
  { name: '面条（煮）', category: 'staple', calories: 110, protein: 3.9, carbs: 21.5, fat: 0.5, fiber: 0.4 },
  { name: '方便面', category: 'staple', calories: 472, protein: 9.5, carbs: 60.9, fat: 21.1, fiber: 0.5 },
  { name: '全麦面包', category: 'staple', calories: 246, protein: 8.5, carbs: 46.0, fat: 3.4, fiber: 6.0 },
  { name: '白面包', category: 'staple', calories: 265, protein: 8.8, carbs: 49.0, fat: 3.3, fiber: 2.3 },
  { name: '油条', category: 'staple', calories: 386, protein: 6.9, carbs: 51.0, fat: 17.6, fiber: 0.9 },
  { name: '烧饼', category: 'staple', calories: 326, protein: 7.5, carbs: 53.2, fat: 9.6 },
  { name: '粽子', category: 'staple', calories: 180, protein: 4.2, carbs: 34.0, fat: 2.5, fiber: 1.0 },
  { name: '汤圆（芝麻）', category: 'staple', calories: 231, protein: 4.3, carbs: 36.5, fat: 7.9 },
  { name: '红薯', category: 'staple', calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, fiber: 3.0 },
  { name: '玉米', category: 'staple', calories: 112, protein: 4.0, carbs: 22.8, fat: 1.2, fiber: 2.9 },
  { name: '土豆', category: 'staple', calories: 76, protein: 2.0, carbs: 17.5, fat: 0.2, fiber: 2.2 },
  { name: '山药', category: 'staple', calories: 57, protein: 1.5, carbs: 12.4, fat: 0.1, fiber: 1.5 },
  { name: '燕麦片', category: 'staple', calories: 377, protein: 13.5, carbs: 66.3, fat: 6.7, fiber: 10.6 },
  { name: '年糕', category: 'staple', calories: 154, protein: 3.2, carbs: 34.5, fat: 0.3 },

  // ===== 肉类 (Meat) =====
  { name: '猪肉（瘦）', category: 'meat', calories: 143, protein: 20.3, carbs: 1.5, fat: 6.2 },
  { name: '猪肉（五花肉）', category: 'meat', calories: 395, protein: 13.2, carbs: 2.4, fat: 37.0 },
  { name: '猪排骨', category: 'meat', calories: 264, protein: 18.3, carbs: 1.7, fat: 20.4 },
  { name: '猪蹄', category: 'meat', calories: 260, protein: 22.6, carbs: 0.5, fat: 18.8 },
  { name: '猪肝', category: 'meat', calories: 129, protein: 19.3, carbs: 5.0, fat: 3.5 },
  { name: '牛肉（瘦）', category: 'meat', calories: 125, protein: 20.2, carbs: 1.2, fat: 4.2 },
  { name: '牛肉（肥牛）', category: 'meat', calories: 250, protein: 18.0, carbs: 2.0, fat: 19.0 },
  { name: '牛腱子', category: 'meat', calories: 118, protein: 21.5, carbs: 1.0, fat: 3.3 },
  { name: '羊肉', category: 'meat', calories: 203, protein: 19.0, carbs: 0.5, fat: 14.1 },
  { name: '鸡胸肉', category: 'meat', calories: 133, protein: 24.6, carbs: 0.9, fat: 3.6 },
  { name: '鸡腿肉', category: 'meat', calories: 181, protein: 20.2, carbs: 0.7, fat: 11.0 },
  { name: '鸡翅', category: 'meat', calories: 222, protein: 18.6, carbs: 4.6, fat: 14.6 },
  { name: '鸡爪', category: 'meat', calories: 254, protein: 16.8, carbs: 2.7, fat: 19.4 },
  { name: '鸭肉', category: 'meat', calories: 240, protein: 15.5, carbs: 0.5, fat: 19.7 },
  { name: '北京烤鸭', category: 'meat', calories: 336, protein: 18.2, carbs: 6.3, fat: 26.8 },
  { name: '腊肉', category: 'meat', calories: 498, protein: 18.2, carbs: 1.9, fat: 46.3 },
  { name: '火腿肠', category: 'meat', calories: 212, protein: 14.0, carbs: 8.5, fat: 13.6 },
  { name: '午餐肉', category: 'meat', calories: 229, protein: 10.5, carbs: 9.4, fat: 16.4 },

  // ===== 海鲜 (Seafood) =====
  { name: '草鱼', category: 'seafood', calories: 113, protein: 17.8, carbs: 0, fat: 4.7 },
  { name: '鲫鱼', category: 'seafood', calories: 108, protein: 17.1, carbs: 0.5, fat: 4.2 },
  { name: '鲈鱼', category: 'seafood', calories: 105, protein: 18.6, carbs: 0, fat: 3.4 },
  { name: '三文鱼', category: 'seafood', calories: 208, protein: 20.4, carbs: 0, fat: 13.6 },
  { name: '金枪鱼', category: 'seafood', calories: 144, protein: 23.3, carbs: 0, fat: 5.5 },
  { name: '带鱼', category: 'seafood', calories: 127, protein: 17.7, carbs: 0.5, fat: 6.1 },
  { name: '虾仁', category: 'seafood', calories: 99, protein: 20.3, carbs: 1.0, fat: 1.4 },
  { name: '基围虾', category: 'seafood', calories: 101, protein: 20.4, carbs: 0.8, fat: 1.5 },
  { name: '小龙虾', category: 'seafood', calories: 87, protein: 16.8, carbs: 0.9, fat: 1.9 },
  { name: '螃蟹（大闸蟹）', category: 'seafood', calories: 103, protein: 17.5, carbs: 0.5, fat: 3.6 },
  { name: '花蛤', category: 'seafood', calories: 62, protein: 10.5, carbs: 1.3, fat: 1.1 },
  { name: '牡蛎', category: 'seafood', calories: 73, protein: 8.7, carbs: 3.9, fat: 1.9 },
  { name: '鱿鱼', category: 'seafood', calories: 92, protein: 17.4, carbs: 1.3, fat: 1.9 },
  { name: '生蚝', category: 'seafood', calories: 57, protein: 6.3, carbs: 2.4, fat: 1.9 },
  { name: '鲍鱼', category: 'seafood', calories: 72, protein: 13.5, carbs: 1.7, fat: 0.8 },
  { name: '海参', category: 'seafood', calories: 55, protein: 12.2, carbs: 0.3, fat: 0.3 },

  // ===== 蛋奶 (Eggs & Dairy) =====
  { name: '鸡蛋（煮）', category: 'egg_dairy', calories: 144, protein: 13.3, carbs: 2.8, fat: 8.8 },
  { name: '鸡蛋（炒）', category: 'egg_dairy', calories: 196, protein: 12.8, carbs: 2.1, fat: 15.1 },
  { name: '鸭蛋', category: 'egg_dairy', calories: 180, protein: 12.6, carbs: 3.1, fat: 13.0 },
  { name: '鹌鹑蛋', category: 'egg_dairy', calories: 160, protein: 12.8, carbs: 1.0, fat: 11.1 },
  { name: '全脂牛奶', category: 'egg_dairy', calories: 61, protein: 3.0, carbs: 4.8, fat: 3.2 },
  { name: '脱脂牛奶', category: 'egg_dairy', calories: 33, protein: 3.4, carbs: 4.9, fat: 0.1 },
  { name: '酸奶（原味）', category: 'egg_dairy', calories: 61, protein: 3.5, carbs: 7.0, fat: 2.5 },
  { name: '奶酪', category: 'egg_dairy', calories: 328, protein: 26.5, carbs: 1.5, fat: 24.0 },
  { name: '黄油', category: 'egg_dairy', calories: 717, protein: 0.8, carbs: 0.1, fat: 81.1 },

  // ===== 蔬菜 (Vegetables) =====
  { name: '白菜', category: 'vegetable', calories: 13, protein: 1.5, carbs: 2.2, fat: 0.1, fiber: 1.0 },
  { name: '菠菜', category: 'vegetable', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
  { name: '西兰花', category: 'vegetable', calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, fiber: 2.6 },
  { name: '番茄', category: 'vegetable', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  { name: '黄瓜', category: 'vegetable', calories: 15, protein: 0.7, carbs: 2.9, fat: 0.1, fiber: 0.5 },
  { name: '胡萝卜', category: 'vegetable', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8 },
  { name: '白萝卜', category: 'vegetable', calories: 18, protein: 0.7, carbs: 3.8, fat: 0.1, fiber: 1.4 },
  { name: '冬瓜', category: 'vegetable', calories: 10, protein: 0.4, carbs: 2.3, fat: 0.1, fiber: 0.8 },
  { name: '南瓜', category: 'vegetable', calories: 26, protein: 1.0, carbs: 6.5, fat: 0.1, fiber: 1.1 },
  { name: '芹菜', category: 'vegetable', calories: 14, protein: 0.8, carbs: 3.0, fat: 0.1, fiber: 1.6 },
  { name: '茄子', category: 'vegetable', calories: 25, protein: 1.0, carbs: 5.9, fat: 0.1, fiber: 3.0 },
  { name: '青椒', category: 'vegetable', calories: 20, protein: 1.0, carbs: 4.2, fat: 0.2, fiber: 1.5 },
  { name: '豆芽', category: 'vegetable', calories: 23, protein: 2.9, carbs: 3.1, fat: 0.1, fiber: 1.0 },
  { name: '蘑菇', category: 'vegetable', calories: 22, protein: 2.5, carbs: 4.2, fat: 0.3, fiber: 2.5 },
  { name: '木耳', category: 'vegetable', calories: 35, protein: 1.5, carbs: 6.0, fat: 0.4, fiber: 7.0 },
  { name: '海带', category: 'vegetable', calories: 28, protein: 1.2, carbs: 4.3, fat: 0.3, fiber: 6.1 },
  { name: '莲藕', category: 'vegetable', calories: 73, protein: 2.6, carbs: 16.4, fat: 0.1, fiber: 2.6 },
  { name: '洋葱', category: 'vegetable', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
  { name: '生菜', category: 'vegetable', calories: 15, protein: 1.4, carbs: 2.1, fat: 0.2, fiber: 0.6 },
  { name: '空心菜', category: 'vegetable', calories: 20, protein: 2.2, carbs: 3.2, fat: 0.2, fiber: 1.5 },
  { name: '苦瓜', category: 'vegetable', calories: 17, protein: 1.0, carbs: 3.5, fat: 0.1, fiber: 1.5 },
  { name: '丝瓜', category: 'vegetable', calories: 16, protein: 1.0, carbs: 3.4, fat: 0.1, fiber: 0.8 },
  { name: '秋葵', category: 'vegetable', calories: 33, protein: 1.9, carbs: 7.5, fat: 0.2, fiber: 3.2 },
  { name: '竹笋', category: 'vegetable', calories: 19, protein: 2.6, carbs: 3.1, fat: 0.2, fiber: 2.8 },

  // ===== 水果 (Fruits) =====
  { name: '苹果', category: 'fruit', calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4 },
  { name: '香蕉', category: 'fruit', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6 },
  { name: '橙子', category: 'fruit', calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 2.4 },
  { name: '葡萄', category: 'fruit', calories: 67, protein: 0.7, carbs: 17.2, fat: 0.2, fiber: 0.9 },
  { name: '西瓜', category: 'fruit', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.1, fiber: 0.3 },
  { name: '草莓', category: 'fruit', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2.0 },
  { name: '蓝莓', category: 'fruit', calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4 },
  { name: '猕猴桃', category: 'fruit', calories: 61, protein: 1.1, carbs: 14.7, fat: 0.5, fiber: 3.0 },
  { name: '芒果', category: 'fruit', calories: 60, protein: 0.8, carbs: 15.0, fat: 0.4, fiber: 1.6 },
  { name: '荔枝', category: 'fruit', calories: 66, protein: 0.8, carbs: 16.5, fat: 0.4, fiber: 0.5 },
  { name: '龙眼', category: 'fruit', calories: 60, protein: 1.2, carbs: 15.5, fat: 0.1, fiber: 1.1 },
  { name: '桃子', category: 'fruit', calories: 39, protein: 0.9, carbs: 10.0, fat: 0.1, fiber: 1.5 },
  { name: '梨', category: 'fruit', calories: 57, protein: 0.4, carbs: 15.2, fat: 0.1, fiber: 3.1 },
  { name: '樱桃', category: 'fruit', calories: 63, protein: 1.1, carbs: 16.0, fat: 0.2, fiber: 2.1 },
  { name: '柚子', category: 'fruit', calories: 42, protein: 0.8, carbs: 10.7, fat: 0.1, fiber: 1.0 },
  { name: '榴莲', category: 'fruit', calories: 147, protein: 1.5, carbs: 27.1, fat: 4.0, fiber: 3.8 },
  { name: '火龙果', category: 'fruit', calories: 60, protein: 1.1, carbs: 14.5, fat: 0.2, fiber: 2.0 },
  { name: '哈密瓜', category: 'fruit', calories: 34, protein: 0.8, carbs: 8.2, fat: 0.1, fiber: 0.9 },
  { name: '菠萝', category: 'fruit', calories: 50, protein: 0.5, carbs: 13.1, fat: 0.1, fiber: 1.4 },
  { name: '山竹', category: 'fruit', calories: 73, protein: 0.4, carbs: 18.0, fat: 0.3, fiber: 1.8 },
  { name: '椰子', category: 'fruit', calories: 354, protein: 3.3, carbs: 15.2, fat: 33.5, fiber: 9.0 },

  // ===== 豆类 (Beans) =====
  { name: '豆腐', category: 'bean', calories: 76, protein: 8.1, carbs: 1.9, fat: 3.7, fiber: 0.4 },
  { name: '嫩豆腐', category: 'bean', calories: 51, protein: 5.0, carbs: 1.5, fat: 2.8 },
  { name: '豆浆', category: 'bean', calories: 31, protein: 2.4, carbs: 1.6, fat: 1.5 },
  { name: '黄豆', category: 'bean', calories: 389, protein: 36.5, carbs: 33.6, fat: 16.0, fiber: 15.5 },
  { name: '绿豆', category: 'bean', calories: 329, protein: 21.6, carbs: 60.7, fat: 0.8, fiber: 6.4 },
  { name: '红豆', category: 'bean', calories: 329, protein: 20.2, carbs: 60.7, fat: 0.6, fiber: 12.8 },
  { name: '毛豆', category: 'bean', calories: 131, protein: 11.8, carbs: 11.1, fat: 5.0, fiber: 4.0 },
  { name: '腐竹', category: 'bean', calories: 476, protein: 53.5, carbs: 12.8, fat: 25.2, fiber: 1.0 },

  // ===== 零食 (Snacks) =====
  { name: '薯片', category: 'snack', calories: 536, protein: 6.8, carbs: 53.0, fat: 34.0 },
  { name: '饼干', category: 'snack', calories: 433, protein: 8.2, carbs: 70.0, fat: 14.0 },
  { name: '巧克力', category: 'snack', calories: 546, protein: 5.0, carbs: 59.4, fat: 34.0 },
  { name: '蛋糕', category: 'snack', calories: 347, protein: 5.1, carbs: 53.4, fat: 13.0 },
  { name: '冰淇淋', category: 'snack', calories: 207, protein: 3.5, carbs: 24.3, fat: 11.0 },
  { name: '牛肉干', category: 'snack', calories: 368, protein: 55.2, carbs: 1.3, fat: 15.0 },
  { name: '坚果混合', category: 'snack', calories: 607, protein: 18.0, carbs: 20.0, fat: 54.0, fiber: 8.0 },
  { name: '核桃', category: 'snack', calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2, fiber: 6.7 },
  { name: '腰果', category: 'snack', calories: 553, protein: 18.2, carbs: 30.2, fat: 43.9, fiber: 3.3 },
  { name: '瓜子', category: 'snack', calories: 582, protein: 19.3, carbs: 16.0, fat: 50.0, fiber: 8.6 },
  { name: '辣条', category: 'snack', calories: 421, protein: 7.8, carbs: 53.2, fat: 22.5 },
  { name: '果冻', category: 'snack', calories: 70, protein: 0, carbs: 17.0, fat: 0 },
  { name: '话梅', category: 'snack', calories: 235, protein: 1.1, carbs: 58.0, fat: 0.3, fiber: 6.8 },

  // ===== 饮品 (Drinks) =====
  { name: '可口可乐', category: 'drink', calories: 42, protein: 0, carbs: 10.6, fat: 0 },
  { name: '雪碧', category: 'drink', calories: 41, protein: 0, carbs: 10.2, fat: 0 },
  { name: '橙汁', category: 'drink', calories: 45, protein: 0.7, carbs: 10.4, fat: 0.1 },
  { name: '苹果汁', category: 'drink', calories: 46, protein: 0.1, carbs: 11.3, fat: 0.1 },
  { name: '啤酒', category: 'drink', calories: 43, protein: 0.5, carbs: 3.6, fat: 0 },
  { name: '白酒', category: 'drink', calories: 298, protein: 0, carbs: 0.8, fat: 0 },
  { name: '红酒', category: 'drink', calories: 85, protein: 0.1, carbs: 2.6, fat: 0 },
  { name: '奶茶', category: 'drink', calories: 65, protein: 1.2, carbs: 11.0, fat: 2.0 },
  { name: '拿铁咖啡', category: 'drink', calories: 56, protein: 3.2, carbs: 4.6, fat: 2.5 },
  { name: '美式咖啡', category: 'drink', calories: 9, protein: 0.3, carbs: 1.6, fat: 0.1 },
  { name: '绿茶', category: 'drink', calories: 1, protein: 0.1, carbs: 0, fat: 0 },
  { name: '红茶', category: 'drink', calories: 1, protein: 0, carbs: 0.2, fat: 0 },
  { name: '运动饮料', category: 'drink', calories: 26, protein: 0, carbs: 6.4, fat: 0 },

  // ===== 快餐 (Fast Food) =====
  { name: '炸鸡腿', category: 'fast_food', calories: 269, protein: 20.1, carbs: 7.2, fat: 17.8 },
  { name: '炸鸡排', category: 'fast_food', calories: 282, protein: 21.3, carbs: 8.4, fat: 18.0 },
  { name: '汉堡包', category: 'fast_food', calories: 257, protein: 11.5, carbs: 29.0, fat: 10.5 },
  { name: '薯条', category: 'fast_food', calories: 312, protein: 3.4, carbs: 41.0, fat: 15.5 },
  { name: '披萨', category: 'fast_food', calories: 266, protein: 11.0, carbs: 33.0, fat: 10.0 },
  { name: '三明治', category: 'fast_food', calories: 233, protein: 10.5, carbs: 28.0, fat: 9.1 },
  { name: '热狗', category: 'fast_food', calories: 247, protein: 9.2, carbs: 28.0, fat: 11.2 },
  { name: '麻辣烫', category: 'fast_food', calories: 82, protein: 6.0, carbs: 4.5, fat: 4.2 },
  { name: '烧烤（羊肉串）', category: 'fast_food', calories: 226, protein: 19.8, carbs: 1.2, fat: 16.2 },
  { name: '关东煮', category: 'fast_food', calories: 35, protein: 3.5, carbs: 2.5, fat: 1.0 },
  { name: '煎饼果子', category: 'fast_food', calories: 184, protein: 6.5, carbs: 25.3, fat: 6.4 },
  { name: '手抓饼', category: 'fast_food', calories: 300, protein: 6.8, carbs: 35.0, fat: 14.5 },

  // ===== 汤羹 (Soups) =====
  { name: '番茄蛋汤', category: 'soup', calories: 25, protein: 1.8, carbs: 2.0, fat: 1.2 },
  { name: '紫菜蛋花汤', category: 'soup', calories: 18, protein: 1.5, carbs: 1.2, fat: 0.8 },
  { name: '鸡汤', category: 'soup', calories: 32, protein: 5.0, carbs: 1.0, fat: 1.5 },
  { name: '排骨汤', category: 'soup', calories: 45, protein: 4.2, carbs: 1.5, fat: 2.5 },
  { name: '酸辣汤', category: 'soup', calories: 35, protein: 2.5, carbs: 3.5, fat: 1.2 },
  { name: '绿豆汤', category: 'soup', calories: 45, protein: 1.8, carbs: 9.5, fat: 0.1 },

  // ===== 调味料 (Condiments) =====
  { name: '食用油', category: 'condiment', calories: 899, protein: 0, carbs: 0, fat: 99.9 },
  { name: '酱油', category: 'condiment', calories: 53, protein: 5.6, carbs: 7.8, fat: 0.1 },
  { name: '醋', category: 'condiment', calories: 18, protein: 0.4, carbs: 3.8, fat: 0 },
  { name: '白糖', category: 'condiment', calories: 387, protein: 0, carbs: 100, fat: 0 },
  { name: '盐', category: 'condiment', calories: 0, protein: 0, carbs: 0, fat: 0 },
  { name: '辣椒酱', category: 'condiment', calories: 82, protein: 2.5, carbs: 11.0, fat: 3.5 },
  { name: '芝麻酱', category: 'condiment', calories: 618, protein: 19.1, carbs: 18.2, fat: 53.6 },
  { name: '番茄酱', category: 'condiment', calories: 79, protein: 1.7, carbs: 17.5, fat: 0.2 },
];

export const exerciseDatabase: { name: string; caloriesPerHour: number }[] = [
  { name: '跑步 (8km/h)', caloriesPerHour: 480 },
  { name: '慢跑', caloriesPerHour: 400 },
  { name: '快走', caloriesPerHour: 300 },
  { name: '散步', caloriesPerHour: 150 },
  { name: '跳绳', caloriesPerHour: 600 },
  { name: '游泳', caloriesPerHour: 500 },
  { name: '骑自行车', caloriesPerHour: 420 },
  { name: '羽毛球', caloriesPerHour: 350 },
  { name: '篮球', caloriesPerHour: 450 },
  { name: '足球', caloriesPerHour: 500 },
  { name: '乒乓球', caloriesPerHour: 250 },
  { name: '瑜伽', caloriesPerHour: 200 },
  { name: '健身操', caloriesPerHour: 380 },
  { name: 'HIIT训练', caloriesPerHour: 650 },
  { name: '力量训练', caloriesPerHour: 350 },
  { name: '爬楼梯', caloriesPerHour: 440 },
  { name: '广场舞', caloriesPerHour: 280 },
  { name: '太极拳', caloriesPerHour: 200 },
  { name: '拳击', caloriesPerHour: 550 },
  { name: '平板支撑', caloriesPerHour: 230 },
  { name: '拉伸', caloriesPerHour: 120 },
  { name: '骑行', caloriesPerHour: 420 },
  { name: '登山', caloriesPerHour: 500 },
  { name: '滑雪', caloriesPerHour: 450 },
];

// Search food database
export function searchFood(query: string): FoodItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return foodDatabase.filter((food) =>
    food.name.toLowerCase().includes(q)
  );
}

// Calculate calories for a given amount
export function calculateCalories(food: FoodItem, amountGrams: number): number {
  return Math.round((food.calories * amountGrams) / 100);
}

// Get food by exact name
export function getFoodByName(name: string): FoodItem | undefined {
  return foodDatabase.find((food) => food.name === name);
}

// Calculate BMR using Mifflin-St Jeor formula
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female'
): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

// Calculate TDEE (Total Daily Energy Expenditure)
export function calculateTDEE(
  bmr: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
): number {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return Math.round(bmr * multipliers[activityLevel]);
}

// Get calorie target based on goal
export function getCalorieTarget(
  tdee: number,
  goal: 'lose' | 'maintain' | 'gain'
): number {
  switch (goal) {
    case 'lose':
      return Math.round(tdee - 500);
    case 'gain':
      return Math.round(tdee + 300);
    default:
      return tdee;
  }
}
