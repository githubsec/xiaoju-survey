import { type Ref, ref, reactive } from 'vue'
import { merge } from 'lodash-es'

import { getSurveyById, getSessionId } from '@/management/api/survey'
import useLogicEngine from './useLogicEngine'

export default function useInitializeSchema(
  surveyId: Ref<string>,
  initializeSchemaCallBack: () => void
) {
  const schema = reactive({
    metaData: null,
    bannerConf: {} as any,
    bottomConf: {} as any,
    skinConf: {} as any,
    baseConf: {} as any,
    submitConf: {} as any,
    pageConf: [] as any,
    logicConf: {} as any,
    questionDataList: [] as any,
    pageEditOne: 1
  })
  const { showLogicEngine, initShowLogicEngine, jumpLogicEngine, initJumpLogicEngine } =
    useLogicEngine(schema)

  function initSchema({ metaData, codeData }: { metaData: any; codeData: any }) {
    console.log('[initSchema] 收到的 codeData.skinConf:', JSON.stringify(codeData.skinConf, null, 2))

    schema.metaData = metaData
    schema.bannerConf = merge({}, schema.bannerConf, codeData.bannerConf)
    schema.bottomConf = merge({}, schema.bottomConf, codeData.bottomConf)
    schema.skinConf = merge({}, schema.skinConf, codeData.skinConf)

    console.log('[initSchema] merge 后的 schema.skinConf:', JSON.stringify(schema.skinConf, null, 2))

    // 确保主题色有默认值
    if (!schema.skinConf.themeConf) {
      console.log('[initSchema] themeConf 不存在，创建默认对象')
      schema.skinConf.themeConf = {}
    }
    if (!schema.skinConf.themeConf.color) {
      console.log('[initSchema] themeConf.color 不存在，设置为 #004EA1')
      schema.skinConf.themeConf.color = '#004EA1'
    }

    console.log('[initSchema] 最终的 schema.skinConf.themeConf.color:', schema.skinConf.themeConf.color)

    schema.baseConf = merge({}, schema.baseConf, codeData.baseConf)
    schema.logicConf = codeData.logicConf
    schema.pageConf = codeData.pageConf
    schema.submitConf = merge({}, schema.submitConf, codeData.submitConf)
    schema.questionDataList = codeData.questionDataList || []
    schema.pageEditOne = 1
  }

  const sessionId = ref('')
  async function initSessionId() {
    const sessionIdKey = `${surveyId.value}_sessionId`
    const localSessionId = sessionStorage.getItem(sessionIdKey)
    if (localSessionId) {
      sessionId.value = localSessionId
    } else {
      const res: Record<string, any> = await getSessionId({ surveyId: surveyId.value })
      if (res.code === 200) {
        sessionId.value = res.data.sessionId
        sessionStorage.setItem(sessionIdKey, sessionId.value)
      }
    }
  }

  async function getSchemaFromRemote() {
    const res: any = await getSurveyById(surveyId.value)
    if (res.code === 200) {
      const metaData = res.data.surveyMetaRes
      document.title = metaData.title
      const data = res.data.surveyConfRes.code
      const {
        bannerConf,
        bottomConf,
        skinConf,
        baseConf,
        submitConf,
        dataConf,
        logicConf = {}
      } = data
      if (!data.pageConf || data.pageConf.length === 0) {
        data.pageConf = [dataConf.dataList.length]
      }
      initSchema({
        metaData,
        codeData: {
          bannerConf,
          bottomConf,
          skinConf,
          baseConf,
          submitConf,
          questionDataList: dataConf.dataList,
          pageConf: data.pageConf,
          logicConf
        }
      })
      initializeSchemaCallBack()

      initShowLogicEngine()
      initJumpLogicEngine()
    } else {
      throw new Error(res.errmsg || '问卷不存在')
    }
  }

  return {
    schema,
    getSchemaFromRemote,
    showLogicEngine,
    jumpLogicEngine,
    sessionId,
    initSessionId
  }
}
