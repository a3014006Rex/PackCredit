<script setup>
import dayjs from "dayjs";
import { AuthAPI } from "@/api/auth";

const loading = ref(false);
const submitting = ref(false);
const questionDialogVisible = ref(false);
const questionFormRef = ref();

const qaList = ref([]);
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
});

const questionForm = reactive({
  question: "",
  category: "",
});

const questionRules = {
  question: [
    { required: true, message: "請輸入問題內容", trigger: "blur" },
  ],
};

const statusMap = {
  PENDING: { label: "待回覆", type: "warning" },
  ANSWERED: { label: "已回答", type: "success" },
  CLOSED: { label: "已結案", type: "info" },
};

const getStatus = (status) => statusMap[status] || { label: status || "－", type: "info" };

const formatDateTime = (value) => {
  if (!value) return "－";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YYYY/MM/DD HH:mm") : "－";
};

const loadQaList = async () => {
  loading.value = true;
  try {
    const response = await AuthAPI.GetQaList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
    });
    const responseData = response.data;
    qaList.value = responseData.success && Array.isArray(responseData.data)
      ? responseData.data
      : [];

    const pager = responseData.pagination || {};
    pagination.currentPage = pager.currentPage || 1;
    pagination.pageSize = pager.pageSize || 10;
    pagination.totalCount = pager.totalCount || 0;
    pagination.totalPages = pager.totalPages || 0;
  } catch (error) {
    console.log("get company qa list error", error);
    qaList.value = [];
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page) => {
  pagination.currentPage = page;
  loadQaList();
};

const openQuestionDialog = () => {
  questionDialogVisible.value = true;
};

const resetQuestionForm = () => {
  questionForm.question = "";
  questionForm.category = "";
  questionFormRef.value?.clearValidate();
};

const submitQuestion = async () => {
  const isValid = await questionFormRef.value?.validate().catch(() => false);
  if (!isValid) return;

  submitting.value = true;
  try {
    const response = await AuthAPI.CreateQaQuestion({
      question: questionForm.question.trim(),
      category: questionForm.category.trim() || null,
    });

    if (!response.data.success) {
      ElMessage.error(response.data.message || "問題送出失敗");
      return;
    }

    ElMessage.success(response.data.message || "問題已送出");
    questionDialogVisible.value = false;
    pagination.currentPage = 1;
    await loadQaList();
  } catch (error) {
    console.log("create company qa error", error);
  } finally {
    submitting.value = false;
  }
};

onMounted(loadQaList);
</script>

<template>
  <div class="qa-page">
    <section class="qa-header">
      <div>
        <div class="qa-eyebrow">會員服務</div>
        <h1>公司 Q&amp;A</h1>
        <p>您可以查看所屬公司所有登入帳號提出的問題與後台回覆。</p>
      </div>
      <el-button type="primary" size="large" @click="openQuestionDialog">
        <i class="bx bx-message-square-add"></i>
        新增問題
      </el-button>
    </section>

    <section v-loading="loading" class="qa-list-section">
      <div v-if="qaList.length" class="qa-list">
        <article v-for="item in qaList" :key="item.id" class="qa-card">
          <div class="qa-card__meta">
            <div class="qa-card__tags">
              <el-tag :type="getStatus(item.status).type" effect="light">
                {{ getStatus(item.status).label }}
              </el-tag>
              <el-tag v-if="item.category" type="info" effect="plain">
                {{ item.category }}
              </el-tag>
            </div>
            <time>{{ formatDateTime(item.questionTime || item.createdAt) }}</time>
          </div>

          <div class="qa-card__question">
            <span class="qa-label qa-label--question">Q</span>
            <div>
              <h2>{{ item.question }}</h2>
              <p class="qa-author">提問者：{{ item.questioner || "－" }}</p>
            </div>
          </div>

          <div class="qa-card__answer" :class="{ 'is-pending': !item.answer }">
            <span class="qa-label qa-label--answer">A</span>
            <div>
              <p>{{ item.answer || "您的問題已送達，等待後台回覆中。" }}</p>
              <p v-if="item.answer" class="qa-author">
                回覆者：{{ item.answerer || "－" }}・{{ formatDateTime(item.answerTime) }}
              </p>
            </div>
          </div>
        </article>
      </div>

      <el-empty
        v-else-if="!loading"
        description="公司目前尚無 Q&A 紀錄"
      >
        <el-button type="primary" @click="openQuestionDialog">提出第一個問題</el-button>
      </el-empty>

      <el-pagination
        v-if="pagination.totalCount > pagination.pageSize"
        class="qa-pagination"
        background
        layout="prev, pager, next"
        :current-page="pagination.currentPage"
        :page-size="pagination.pageSize"
        :total="pagination.totalCount"
        @current-change="handlePageChange"
      />
    </section>

    <el-dialog
      v-model="questionDialogVisible"
      title="新增問題"
      width="min(560px, 92vw)"
      destroy-on-close
      @closed="resetQuestionForm"
    >
      <el-form
        ref="questionFormRef"
        :model="questionForm"
        :rules="questionRules"
        label-position="top"
      >
        <el-form-item label="問題內容" prop="question">
          <el-input
            v-model="questionForm.question"
            type="textarea"
            :rows="6"
            maxlength="4000"
            show-word-limit
            placeholder="請描述您想詢問的事項"
          />
        </el-form-item>
        <el-form-item label="分類（選填）" prop="category">
          <el-input
            v-model="questionForm.category"
            maxlength="100"
            show-word-limit
            placeholder="例如：商品、訂單、帳務"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button :disabled="submitting" @click="questionDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitQuestion">送出問題</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.qa-page {
  min-height: 100%;
  padding: 32px;
  background:
    radial-gradient(circle at top right, rgba(27, 154, 170, .12), transparent 32%),
    #f5f7fa;
}

.qa-header {
  margin-bottom: 24px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;

  h1 {
    margin: 4px 0 8px;
    color: $text-primary;
    font-size: 30px;
  }

  p {
    margin: 0;
    color: $text-light;
    line-height: 1.6;
  }

  .el-button i {
    margin-right: 6px;
    font-size: 18px;
  }
}

.qa-eyebrow {
  color: $primary;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .12em;
}

.qa-list-section {
  min-height: 260px;
}

.qa-list {
  display: grid;
  gap: 16px;
}

.qa-card {
  padding: 22px 24px;
  background: #fff;
  border: 1px solid #e6ebf1;
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(26, 82, 118, .06);
}

.qa-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid #eef2f6;

  time {
    color: $text-light;
    font-size: 13px;
    white-space: nowrap;
  }
}

.qa-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.qa-card__question,
.qa-card__answer {
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 12px;
}

.qa-card__question {
  padding: 20px 0 16px;

  h2 {
    margin: 2px 0 8px;
    color: $text-primary;
    font-size: 17px;
    line-height: 1.6;
    white-space: pre-wrap;
  }
}

.qa-card__answer {
  padding: 16px;
  background: #f0fafb;
  border-radius: 10px;

  &.is-pending {
    background: #f8fafc;
    color: $text-light;
  }

  p {
    margin: 2px 0 8px;
    line-height: 1.7;
    white-space: pre-wrap;
  }
}

.qa-label {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  font-weight: 800;
}

.qa-label--question { background: $primary; }
.qa-label--answer { background: #4f9f7f; }

.qa-author {
  margin: 0 !important;
  color: $text-light;
  font-size: 12px;
}

.qa-pagination {
  justify-content: center;
  margin-top: 24px;
}

@media (max-width: 640px) {
  .qa-page { padding: 22px 14px; }

  .qa-header {
    align-items: stretch;
    flex-direction: column;

    .el-button { align-self: flex-start; }
  }

  .qa-card { padding: 18px 16px; }

  .qa-card__meta {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }
}
</style>
