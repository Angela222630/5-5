# 5-5

這是一個純前端手機網頁垃圾分類辨識應用範例，會使用 `models` 資料夾內的 Teachable Machine 模型進行推論。

## 內容

- `index.html`：主畫面
- `style.css`：手機響應式樣式
- `app.js`：相機、上傳圖片與模型推論邏輯
- `models/`：已訓練好的 Teachable Machine 模型檔案

## 使用方式

1. 在支援 HTTPS 或本機伺服器環境下開啟應用程式。
2. 啟動相機或上傳照片。
3. 拍照後即可顯示分類結果。

## 本機測試

建議使用簡單伺服器啟動專案，例如：

```bash
cd /workspaces/5-5
python3 -m http.server 8000
```

然後打開瀏覽器：

```
http://127.0.0.1:8000
```

## 模型標籤

- `shoes` → 鞋子
- `plastic` → 塑膠
- `clothes` → 衣服

## 注意

- 相機功能需要瀏覽器允許相機權限。
- 本專案純前端執行，模型已放在 `models` 資料夾內。