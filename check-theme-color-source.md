# 检查主题色 #ffa600 的来源

## 问题确认

前端日志显示后端返回的 `skinConf.themeConf.color` 就是 `#ffa600`，说明问题在后端。

## 排查步骤

### 1. 检查数据库中的所有问卷配置

```javascript
// 连接数据库
mongosh mongodb://localhost:27017/xiaojuSurvey

// 查看所有问卷的主题色分布
db.surveyConf.aggregate([
  {
    $group: {
      _id: "$code.skinConf.themeConf.color",
      count: { $sum: 1 },
      pageIds: { $push: "$pageId" }
    }
  },
  {
    $sort: { count: -1 }
  }
])

// 这会显示每个颜色有多少个问卷使用，以及对应的 pageId
```

### 2. 查看最新创建的问卷

```javascript
// 查看刚才新建的问卷
db.surveyConf.find({}).sort({ createdAt: -1 }).limit(1).pretty()

// 查看它的 pageId 对应的元数据
db.surveyMeta.find({}).sort({ createdAt: -1 }).limit(1).pretty()
```

### 3. 检查是否有"复制"操作

```javascript
// 查看最新问卷的元数据，检查 createMethod 和 createFrom 字段
db.surveyMeta.find({}).sort({ createdAt: -1 }).limit(1).pretty()

// 如果 createMethod 是 "copy"，说明是从其他问卷复制的
// createFrom 字段会指向源问卷的 ID
```

### 4. 查找主题色为 #ffa600 的第一个问卷

```javascript
// 找到第一个使用 #ffa600 的问卷（最早创建的）
db.surveyConf.find(
  { "code.skinConf.themeConf.color": "#ffa600" }
).sort({ createdAt: 1 }).limit(1).pretty()

// 查看它的创建信息
var oldestSurvey = db.surveyConf.findOne(
  { "code.skinConf.themeConf.color": "#ffa600" },
  { sort: { createdAt: 1 } }
)
db.surveyMeta.findOne({ _id: oldestSurvey.pageId })
```

### 5. 检查是否有默认模板

```javascript
// 检查是否有特殊的"模板"问卷
db.surveyMeta.find({
  $or: [
    { title: /模板|template/i },
    { remark: /模板|template/i }
  ]
}).pretty()
```

## 可能的原因

### 情况 1：复制问卷导致
如果 `createMethod` 是 "copy"，说明新建问卷时是从某个旧问卷复制的。

**解决方案**：
- 找到源问卷（createFrom 字段）
- 更新源问卷的主题色为 #004EA1
- 或者修改前端创建问卷的逻辑，不使用复制功能

### 情况 2：数据库中的旧数据
数据库中可能有一个"默认问卷"或"模板问卷"，每次创建新问卷时都会复制它。

**解决方案**：
```javascript
// 更新所有 #ffa600 的问卷为 #004EA1
db.surveyConf.updateMany(
  { "code.skinConf.themeConf.color": "#ffa600" },
  {
    $set: {
      "code.skinConf.themeConf.color": "#004EA1",
      "updatedAt": new Date()
    }
  }
)
```

### 情况 3：代码中有硬编码
虽然我们已经检查了所有 JSON 文件，但可能在 TypeScript/JavaScript 代码中有硬编码。

**检查方法**：
在服务器代码中搜索 #ffa600：
```bash
grep -r "ffa600" D:\develop\vue\xiaoju-survey\server\src --include="*.ts" --include="*.js"
```

## 下一步

请执行上述数据库查询，并告诉我：
1. 主题色分布统计（有多少个问卷使用 #ffa600）
2. 最新创建的问卷的 createMethod 是什么
3. 是否有 createFrom 字段（指向源问卷）
