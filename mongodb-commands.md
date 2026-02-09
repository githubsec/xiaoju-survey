# MongoDB 主题色检查和修复命令

## 步骤 1: 连接到 MongoDB

```bash
# 连接到 MongoDB（根据实际情况调整连接参数）
mongosh
# 或者指定数据库
mongosh mongodb://localhost:27017/xiaojuSurvey
```

## 步骤 2: 切换到数据库

```javascript
use xiaojuSurvey
```

## 步骤 3: 查看所有问卷的主题色配置

### 3.1 查看主题色不是 #004EA1 的问卷

```javascript
db.surveyConf.find(
  {
    "code.skinConf.themeConf.color": { $exists: true, $ne: "#004EA1" }
  },
  {
    pageId: 1,
    "code.skinConf.themeConf.color": 1,
    createdAt: 1
  }
).pretty()
```

### 3.2 统计主题色分布

```javascript
db.surveyConf.aggregate([
  {
    $group: {
      _id: "$code.skinConf.themeConf.color",
      count: { $sum: 1 }
    }
  },
  {
    $sort: { count: -1 }
  }
])
```

### 3.3 查看所有问卷的主题色（包括未设置的）

```javascript
db.surveyConf.find(
  {},
  {
    pageId: 1,
    "code.skinConf.themeConf.color": 1,
    createdAt: 1
  }
).limit(20).pretty()
```

### 3.4 统计总数

```javascript
// 总问卷数
db.surveyConf.countDocuments()

// 主题色为 #004EA1 的问卷数
db.surveyConf.countDocuments({ "code.skinConf.themeConf.color": "#004EA1" })

// 主题色不是 #004EA1 的问卷数
db.surveyConf.countDocuments({ "code.skinConf.themeConf.color": { $ne: "#004EA1", $exists: true } })
```

## 步骤 4: 更新主题色为 #004EA1

### ⚠️ 注意：执行更新前请先备份数据库！

### 4.1 备份数据库

```bash
# 在 shell 中执行（不是在 mongosh 中）
mongodump --db xiaojuSurvey --out ./backup-$(date +%Y%m%d-%H%M%S)
```

### 4.2 更新所有不是 #004EA1 的主题色

```javascript
// 查看将要更新的记录数
db.surveyConf.countDocuments({
  "code.skinConf.themeConf.color": { $exists: true, $ne: "#004EA1" }
})

// 执行更新（会显示更新的记录数）
db.surveyConf.updateMany(
  {
    "code.skinConf.themeConf.color": { $exists: true, $ne: "#004EA1" }
  },
  {
    $set: {
      "code.skinConf.themeConf.color": "#004EA1",
      "updatedAt": new Date()
    }
  }
)
```

### 4.3 更新特定颜色的问卷

```javascript
// 例如：只更新主题色为 #4a4c5b 的问卷
db.surveyConf.updateMany(
  {
    "code.skinConf.themeConf.color": "#4a4c5b"
  },
  {
    $set: {
      "code.skinConf.themeConf.color": "#004EA1",
      "updatedAt": new Date()
    }
  }
)
```

### 4.4 为没有设置主题色的问卷添加主题色

```javascript
db.surveyConf.updateMany(
  {
    "code.skinConf.themeConf.color": { $exists: false }
  },
  {
    $set: {
      "code.skinConf.themeConf.color": "#004EA1",
      "updatedAt": new Date()
    }
  }
)
```

## 步骤 5: 验证更新结果

```javascript
// 再次查看主题色分布
db.surveyConf.aggregate([
  {
    $group: {
      _id: "$code.skinConf.themeConf.color",
      count: { $sum: 1 }
    }
  },
  {
    $sort: { count: -1 }
  }
])

// 确认是否还有不是 #004EA1 的问卷
db.surveyConf.countDocuments({
  "code.skinConf.themeConf.color": { $ne: "#004EA1", $exists: true }
})
```

## 步骤 6: 查看最近创建的问卷

```javascript
// 查看最近创建的 5 个问卷的主题色
db.surveyConf.find(
  {},
  {
    pageId: 1,
    "code.skinConf.themeConf.color": 1,
    createdAt: 1
  }
).sort({ createdAt: -1 }).limit(5).pretty()
```

## 常用辅助命令

```javascript
// 查看单个问卷的完整配置
db.surveyConf.findOne({ pageId: "问卷ID" }).code.skinConf

// 查看 surveyConf 集合的索引
db.surveyConf.getIndexes()

// 查看集合统计信息
db.surveyConf.stats()
```

## 恢复备份（如果需要）

```bash
# 在 shell 中执行
mongorestore --db xiaojuSurvey ./backup-日期时间/xiaojuSurvey
```
