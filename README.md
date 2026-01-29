# 部署memos.top

## 自托管memos
参照 https://blog.memos.ee/archives/21.html
## 部署到vercel
>[!tip] 
 提示
 `main`适配v0.25.3
 若使用其他版本的`memos`请参考`Releases`中的版本

环境变量:

```
MEMOS_HOST=https://memos.ee   # memos地址
MEMOS_USER_ID=1       # 用户ID
MEMOS_LIMIT=20       # 每页显示数量
MEMOS_TITTLE=提剑追梦 # 标题
MEMOS_HEAD=          # 头部支持HTML代码
MEMOS_MENU=          # 菜单支持HTML代码
MEMOS_ICON=          # 图标
MEMOS_FOOTER=        #底部支持HTML代码
```

[![https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjkjoy%2Fmemos-top-vercel%2Ftree%2Fmain%2F](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjkjoy%2Fmemos-top-vercel%2Ftree%2Fmain%2F)
