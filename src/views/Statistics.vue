<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Service } from '../api/generated'
import type { StatisticsOverview, DailyStats, PopularArticle } from '../api/generated'

// 总览
const overview = ref<StatisticsOverview | null>(null)
// 今日统计
const daily = ref<DailyStats | null>(null)
// 热门文章
const popularArticles = ref<PopularArticle[]>([])
// 热门帖子
const popularPosts = ref<PopularArticle[]>([])
const loading = ref(true)

const fetchStatistics = async () => {
  loading.value = true
  try {
    const [ov, dy, pa, pp] = await Promise.all([
      Service.getStatisticsOverviewApiV1StatisticsOverviewGet(),
      Service.getDailyStatsApiV1StatisticsDailyGet(),
      Service.getPopularArticlesApiV1StatisticsPopularArticlesGet(10),
      Service.getPopularByLikesApiV1StatisticsPopularByLikesGet('post', 10)
    ])
    overview.value = ov
    daily.value = dy
    popularArticles.value = pa
    popularPosts.value = pp
  } catch (error) {
    console.error('获取统计数据失败', error)
  } finally { loading.value = false }
}

onMounted(() => { fetchStatistics() })

const formatNum = (n?: number) => n?.toLocaleString() ?? '0'
</script>

<template>
  <div class="statistics-container">
    <van-nav-bar title="数据统计" fixed placeholder safe-area-inset-top />

    <van-skeleton :row="5" :loading="loading">
      <div class="stat-body">

        <!-- 今日统计 -->
        <div class="section">
          <div class="section-title"><van-icon name="clock-o" /> 今日新增</div>
          <div class="daily-grid" v-if="daily">
            <div class="daily-item">
              <span class="num">{{ formatNum(daily.new_users) }}</span>
              <span class="label">新用户</span>
            </div>
            <div class="daily-item">
              <span class="num">{{ formatNum(daily.new_articles) }}</span>
              <span class="label">新文章</span>
            </div>
            <div class="daily-item">
              <span class="num">{{ formatNum(daily.new_posts) }}</span>
              <span class="label">新帖子</span>
            </div>
            <div class="daily-item">
              <span class="num">{{ formatNum(daily.new_governance_records) }}</span>
              <span class="label">治理记录</span>
            </div>
          </div>
        </div>

        <!-- 平台总览 -->
        <div class="section" v-if="overview">
          <div class="section-title"><van-icon name="chart-trending-o" /> 平台总览</div>
          <div class="overview-grid">
            <div class="ov-item"><span class="ov-num">{{ formatNum(overview.total_users) }}</span><span class="ov-label">用户</span></div>
            <div class="ov-item"><span class="ov-num">{{ formatNum(overview.total_articles) }}</span><span class="ov-label">文章</span></div>
            <div class="ov-item"><span class="ov-num">{{ formatNum(overview.total_posts) }}</span><span class="ov-label">帖子</span></div>
            <div class="ov-item"><span class="ov-num">{{ formatNum(overview.total_pests) }}</span><span class="ov-label">虫害</span></div>
            <div class="ov-item"><span class="ov-num">{{ formatNum(overview.total_governance_records) }}</span><span class="ov-label">记录</span></div>
            <div class="ov-item"><span class="ov-num">{{ formatNum(overview.total_warnings) }}</span><span class="ov-label">预警</span></div>
            <div class="ov-item highlight"><span class="ov-num">{{ formatNum(overview.pending_articles) }}</span><span class="ov-label">待审文章</span></div>
            <div class="ov-item highlight"><span class="ov-num">{{ formatNum(overview.pending_posts) }}</span><span class="ov-label">待审帖子</span></div>
          </div>
        </div>

        <!-- 热门文章 -->
        <div class="section" v-if="popularArticles.length">
          <div class="section-title"><van-icon name="fire-o" color="#ee0a24" /> 热门文章（浏览量）</div>
          <div class="rank-list">
            <div v-for="(item, idx) in popularArticles" :key="item.id" class="rank-item">
              <span class="rank-badge" :class="'rank-' + (idx + 1)">{{ idx + 1 }}</span>
              <span class="rank-title">{{ item.title }}</span>
              <span class="rank-views">{{ item.views }} 阅读</span>
            </div>
          </div>
        </div>

        <!-- 热门帖子 -->
        <div class="section" v-if="popularPosts.length">
          <div class="section-title"><van-icon name="fire-o" color="#ff976a" /> 热门帖子（点赞数）</div>
          <div class="rank-list">
            <div v-for="(item, idx) in popularPosts" :key="item.id" class="rank-item">
              <span class="rank-badge" :class="'rank-' + (idx + 1)">{{ idx + 1 }}</span>
              <span class="rank-title">{{ item.title }}</span>
              <span class="rank-views">{{ item.views }} 阅读</span>
            </div>
          </div>
        </div>

      </div>
    </van-skeleton>

    <van-empty v-if="!loading && !overview" description="暂无统计数据" />
  </div>
</template>

<style scoped>
.statistics-container { background-color: #f7f8fa; min-height: 100vh; }
.stat-body { padding: 12px 16px; }
.section {
  background: #fff; border-radius: 14px; padding: 16px; margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
}
.section-title {
  font-size: 16px; font-weight: 600; color: #323233; margin-bottom: 14px;
  display: flex; align-items: center; gap: 6px;
}

/* 今日统计 */
.daily-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; text-align: center; }
.daily-item { display: flex; flex-direction: column; gap: 4px; }
.num { font-size: 24px; font-weight: 700; color: #07c160; }
.label { font-size: 12px; color: #969799; }

/* 总览 */
.overview-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; text-align: center; }
.ov-item { display: flex; flex-direction: column; gap: 2px; }
.ov-num { font-size: 22px; font-weight: 700; color: #1989fa; }
.ov-label { font-size: 12px; color: #969799; }
.ov-item.highlight .ov-num { color: #ee0a24; }

/* 排行榜 */
.rank-list { display: flex; flex-direction: column; gap: 10px; }
.rank-item { display: flex; align-items: center; gap: 10px; }
.rank-badge {
  width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center;
  justify-content: center; font-size: 12px; font-weight: 700; color: #fff; background: #c8c9cc; flex-shrink: 0;
}
.rank-badge.rank-1 { background: #ee0a24; }
.rank-badge.rank-2 { background: #ff976a; }
.rank-badge.rank-3 { background: #ffc300; color: #333; }
.rank-title { flex: 1; font-size: 14px; color: #323233; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rank-views { font-size: 12px; color: #969799; flex-shrink: 0; }
</style>
