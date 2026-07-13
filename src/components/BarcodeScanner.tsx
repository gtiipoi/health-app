import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { db } from '../db/database';
import { foodDatabase } from '../utils/foodData';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export default function BarcodeScanner() {
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [productInfo, setProductInfo] = useState<any>(null);
  const [amount, setAmount] = useState(100);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScan = async () => {
    setError('');
    setProductInfo(null);
    setScanning(true);

    try {
      const scanner = new Html5Qrcode('reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decoded) => {
          setBarcode(decoded);
          await scanner.stop();
          setScanning(false);
          fetchProduct(decoded);
        },
        () => {}
      );
    } catch (err: any) {
      if (err?.message?.includes('NotAllowedError') || err?.message?.includes('Permission')) {
        setError('无法访问相机，请在设置中允许相机权限');
      } else {
        setError('扫描启动失败，请重试');
      }
      setScanning(false);
    }
  };

  const stopScan = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
    }
    setScanning(false);
  };

  const fetchProduct = async (code: string) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`);
      const data = await res.json();

      if (data.status === 1 && data.product) {
        const p = data.product;
        const nutriments = p.nutriments || {};

        setProductInfo({
          name: p.product_name || p.generic_name || '未知产品',
          brand: p.brands || '',
          image: p.image_url || p.image_front_url || '',
          calories: nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0,
          protein: nutriments.proteins_100g || nutriments.proteins || 0,
          carbs: nutriments.carbohydrates_100g || nutriments.carbohydrates || 0,
          fat: nutriments.fat_100g || nutriments.fat || 0,
          fiber: nutriments.fiber_100g || nutriments.fiber || 0,
        });
      } else {
        setError('未找到该条码对应的产品信息');
      }
    } catch {
      setError('无法连接到食品数据库，请检查网络');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = () => {
    if (!barcode.trim()) return;
    fetchProduct(barcode.trim());
  };

  const handleAddToDiary = async (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    if (!productInfo) return;

    const ratio = amount / 100;
    await db.foodEntries.add({
      date: getToday(),
      mealType,
      foodName: productInfo.name,
      amount,
      calories: Math.round(productInfo.calories * ratio),
      protein: Math.round(productInfo.protein * ratio * 10) / 10,
      carbs: Math.round(productInfo.carbs * ratio * 10) / 10,
      fat: Math.round(productInfo.fat * ratio * 10) / 10,
      fiber: productInfo.fiber ? Math.round(productInfo.fiber * ratio * 10) / 10 : undefined,
      createdAt: new Date().toISOString(),
    });

    setSuccessMsg('已添加到饮食记录！');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Scanner view */}
      <div className="card overflow-hidden p-0">
        <div id="reader" className={`${scanning ? '' : 'hidden'}`} />
        {!scanning && !productInfo && (
          <div className="py-12 text-center">
            <div className="text-5xl mb-4">📷</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">扫码查询食物</h3>
            <p className="text-sm text-gray-400 mb-4">
              扫描食品包装上的条形码，自动获取营养成分
            </p>
            <button onClick={startScan} className="btn-primary">
              开始扫描
            </button>
          </div>
        )}
        {scanning && (
          <div className="py-4 text-center">
            <button onClick={stopScan} className="text-red-500 text-sm font-medium">
              停止扫描
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Success */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-600 animate-pulse">
          ✅ {successMsg}
        </div>
      )}

      {/* Manual input */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">手动输入条码</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="输入条形码数字..."
            className="input-field flex-1"
          />
          <button
            onClick={handleManualSearch}
            disabled={!barcode.trim() || loading}
            className="btn-primary text-sm whitespace-nowrap"
          >
            {loading ? '查询中...' : '查询'}
          </button>
        </div>
      </div>

      {/* Product info */}
      {productInfo && (
        <div className="card space-y-3">
          {productInfo.image && (
            <img
              src={productInfo.image}
              alt={productInfo.name}
              className="w-24 h-24 object-contain mx-auto rounded-lg bg-gray-50"
            />
          )}
          <div className="text-center">
            <h3 className="font-bold text-gray-800">{productInfo.name}</h3>
            {productInfo.brand && (
              <p className="text-xs text-gray-400">{productInfo.brand}</p>
            )}
          </div>

          <div className="bg-green-50 rounded-xl p-3 text-center">
            <span className="text-2xl font-bold text-primary-600">
              {productInfo.calories}
            </span>
            <span className="text-sm text-gray-400"> kcal/100g</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-red-50 rounded-lg py-2">
              <div className="font-bold text-red-600">{productInfo.protein}g</div>
              <div className="text-gray-400">蛋白质</div>
            </div>
            <div className="bg-amber-50 rounded-lg py-2">
              <div className="font-bold text-amber-600">{productInfo.carbs}g</div>
              <div className="text-gray-400">碳水</div>
            </div>
            <div className="bg-blue-50 rounded-lg py-2">
              <div className="font-bold text-blue-600">{productInfo.fat}g</div>
              <div className="text-gray-400">脂肪</div>
            </div>
            <div className="bg-gray-50 rounded-lg py-2">
              <div className="font-bold text-gray-600">{productInfo.fiber || 0}g</div>
              <div className="text-gray-400">纤维</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">份量：</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-20 input-field text-center"
              min={1}
            />
            <span className="text-xs text-gray-500">g = {Math.round(productInfo.calories * amount / 100)} kcal</span>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-2">添加到饮食记录：</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'breakfast' as const, label: '早餐' },
                { key: 'lunch' as const, label: '午餐' },
                { key: 'dinner' as const, label: '晚餐' },
                { key: 'snack' as const, label: '加餐' },
              ].map((meal) => (
                <button
                  key={meal.key}
                  onClick={() => handleAddToDiary(meal.key)}
                  className="py-2 rounded-xl bg-primary-50 text-primary-600 text-xs font-medium hover:bg-primary-100 transition-colors"
                >
                  + {meal.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
