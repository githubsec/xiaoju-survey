import { defineComponent, computed } from 'vue'
import './style.scss'

export default defineComponent({
  name: 'BaseRate',
  props: {
    name: {
      type: String,
      default: ''
    },
    value: {
      type: [String, Number],
      default: 0
    },
    min: {
      type: Number,
      default: 1
    },
    max: {
      type: Number,
      default: 5
    },
    iconClass: {
      type: String,
      default: 'number'
    },
    readonly: {
      type: Boolean,
      default: false
    },
    rangeConfig: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['change'],
  setup(props, { emit }) {
    const rating = computed({
      get() {
        return props.value
      },
      set(val) {
        emit('change', val)
      }
    })
    const range = computed(() => {
      const { min, max } = props
      if (min > max) {
        return []
      }
      const res = []
      for (let i = min; i <= max; i++) {
        res.push(i)
      }
      return res
    })
    const handleClick = (num) => {
      if (props.readonly) return

      if (rating.value !== num) {
        rating.value = num
      }
    }
    return {
      rating,
      range,
      handleClick
    }
  },
  render() {
    const { rating, range, iconClass, rangeConfig } = this
    const hasSelection = rating > 0

    return (
      <div class="rate-wrapper-main">
        <div class="rate-box">
          {range.map((num, index) => {
            const explain = rangeConfig[num]?.explain
            // 未选择时显示所有释义，选择后只显示选中项的释义
            const shouldShowExplain = explain && (!hasSelection || num === rating)

            return (
              <div key={'rate' + index} class="rate-item-wrapper">
                <div
                  class={['rate-item', num <= rating ? 'on' : 'off', iconClass]}
                  data-num={num}
                  onClick={(e) => {
                    const value = parseInt(e.currentTarget.dataset.num, 10)
                    this.handleClick(value)
                  }}
                >
                  {iconClass === 'number' ? num : ''}
                </div>
                {shouldShowExplain && <div class="rate-explain">{explain}</div>}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
})
