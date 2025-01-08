<template>
  <el-dropdown :hide-on-click="false" :show-timeout="100" trigger="click">
    <el-button plain>
      可见范围 ({{ visibleRange }})
      <i class="el-icon-caret-bottom el-icon--right" />
    </el-button>
    <el-dropdown-menu slot="dropdown" class="no-border">
      <el-radio-group v-model="visibleRange" style="padding: 5px 15px;">
        <el-radio v-for="item in visibleRangeOptions" :key="item.key" :label="item.key">
          {{ item.name }}
        </el-radio>
      </el-radio-group>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  props: {
    value: {
      required: true,
      default: () => [],
      type: Array
    }
  },
  data() {
    return {
      visibleRangeOptions: [
        { key: 'public', name: '公开' },
        { key: 'private', name: '私有' },
        { key: 'college', name: '学院可见' }
      ]
    }
  },
  computed: {
    visibleRange: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  }
}
</script>
