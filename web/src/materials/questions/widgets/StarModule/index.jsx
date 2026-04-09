import { defineComponent, computed, shallowRef, defineAsyncComponent } from 'vue'
import BaseRate from '../BaseRate'
import './style.scss'

export default defineComponent({
  name: 'StarModule',
  props: {
    type: {
      type: String,
      default: ''
    },
    field: {
      type: String,
      default: ''
    },
    value: {
      type: [String, Number],
      default: 0
    },
    starMin: {
      type: Number,
      default: 1
    },
    starMax: {
      type: Number,
      default: 5
    },
    starStyle: {
      type: String,
      default: 'star'
    },
    readonly: {
      type: Boolean,
      default: false
    },
    rangeConfig: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  emits: ['change'],
  setup(props, { emit }) {
    const rating = computed({
      get() {
        return props.value
      },
      set(val) {
        const key = props.field
        emit('change', {
          key,
          value: val
        })
      }
    })
    const currentRangeConfig = computed(() => {
      return props.rangeConfig[rating.value]
    })
    const isShowInput = computed(() => {
      return currentRangeConfig.value?.isShowInput
    })
    const starClass = computed(() => {
      const { starStyle } = props
      switch (starStyle) {
        case 'star':
          return 'qicon qicon-xingxing'
        case 'love':
          return 'qicon qicon-aixin'
        case 'number':
          return 'number'
        default:
          return 'qicon qicon-xingxing'
      }
    })
    const confirmStar = (num) => {
      if (props.readonly) return
      rating.value = num
    }
    const onMoreDataChange = (data) => {
      const { key, value } = data
      emit('change', {
        key,
        value
      })
    }
    const selectMoreView = shallowRef(null)
    if (props.readonly) {
      selectMoreView.value = defineAsyncComponent(
        () => import('@materials/questions/QuestionContainerB')
      )
    } else {
      selectMoreView.value = defineAsyncComponent(
        () => import('@materials/questions/QuestionRuleContainer')
      )
    }
    return {
      rating,
      currentRangeConfig,
      starClass,
      isShowInput,
      confirmStar,
      onMoreDataChange,
      selectMoreView
    }
  },
  render() {
    const {
      field,
      value,
      rating,
      readonly,
      starClass,
      currentRangeConfig,
      isShowInput,
      onMoreDataChange,
      rangeConfig,
      selectMoreView,
      confirmStar
    } = this

  // 👇 核心逻辑：生成所有 explain 的 JSX 元素
  // 注意：只有当用户没有选择（rating <= 0）且 rangeConfig 存在时才显示
    const allExplains = !rating && rangeConfig ? (
      <div class="all-explains-row">
        {Object.keys(rangeConfig).map((score) => {
          const config = rangeConfig[score];
          // 确保 config 存在且有 explain 字段
          if (config && config.explain) {
            return (
              <span key={`explain-${score}`} class="explain-item">
              {/* 这里的样式可以根据设计图调整，例如 [1]: 文案 */}
              {config.explain}
            </span>
            );
          }
          return null;
        })}
      </div>
    ) : null;

    return (
      <div class="star-wrapper-main">
        <BaseRate
          name={field}
          value={value}
          readonly={readonly}
          iconClass={starClass}
          onChange={confirmStar}
          key={`star-rate-${field}`}
        />
        {allExplains}
        {currentRangeConfig && <p class="explain radio-star">{currentRangeConfig.explain}</p>}
        {isShowInput && (
          <selectMoreView
            showTitle={false}
            key={`${field}_${rating}`}
            moduleConfig={{
              type: 'selectMoreModule',
              field: `${field}_${rating}`,
              placeholder: rangeConfig[rating]?.text,
              value: rangeConfig[rating]?.othersValue || ''
            }}
            onChange={(e) => onMoreDataChange(e)}
          ></selectMoreView>
        )}
      </div>
    )
  }
})
