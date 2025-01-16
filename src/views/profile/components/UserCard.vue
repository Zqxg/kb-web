<template>
  <el-card style="margin-bottom:20px;">
    <div slot="header" class="clearfix">
      <span>About me</span>
    </div>

    <div class="user-profile">
      <div class="box-center">
        <!-- Display Avatar -->
        <pan-thumb :image="avatar" :height="'100px'" :width="'100px'" :hoverable="false">
          <div>Hello</div>
          {{ roles.join(', ') }} <!-- Display roles -->
        </pan-thumb>
      </div>
      <div class="box-center">
        <!-- Display Nickname and Role -->
        <div class="user-name text-center">{{ nickname }}</div>
        <div class="user-role text-center text-muted">{{ roles.join(', ') | uppercaseFirst }}</div>
      </div>
    </div>
    <!-- Display Other User Information -->
    <div class="user-details">
      <div class="user-details user-bio-section">
        <div class="user-bio-section-header"><svg-icon icon-class="user" /><span> Info</span></div>
        <div class="user-detail-item">
          <strong>Email:</strong> {{ email }}
        </div>
        <div class="user-detail-item">
          <strong>Phone:</strong> {{ phone }}
        </div>
        <div class="user-detail-item">
          <strong>College ID:</strong> {{ collegeId }}
        </div>
        <div class="user-detail-item">
          <strong>Student ID:</strong> {{ studentId }}
        </div>
      </div>
    </div>

    <div class="user-bio">
      <div class="user-education user-bio-section">
        <div class="user-bio-section-header"><svg-icon icon-class="education" /><span>Education</span></div>
        <div class="user-bio-section-body">
          <div class="text-muted">
            JS in Computer Science from the University of Technology
          </div>
        </div>
      </div>

      <div class="user-skills user-bio-section">
        <div class="user-bio-section-header"><svg-icon icon-class="skill" /><span>Skills</span></div>
        <div class="user-bio-section-body">
          <div class="progress-item">
            <span>Vue</span>
            <el-progress :percentage="70" />
          </div>
          <div class="progress-item">
            <span>JavaScript</span>
            <el-progress :percentage="18" />
          </div>
          <div class="progress-item">
            <span>Css</span>
            <el-progress :percentage="12" />
          </div>
          <div class="progress-item">
            <span>ESLint</span>
            <el-progress :percentage="100" status="success" />
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import { mapState } from 'vuex'
import PanThumb from '@/components/PanThumb'

export default {
  components: { PanThumb },
  computed: {
    ...mapState('user', [
      'nickname', 'email', 'roles', 'phone', 'avatar', 'collegeId', 'studentId'
    ])
  }
}
</script>

<style lang="scss" scoped>
.box-center {
  margin: 0 auto;
  display: table;
}

.text-muted {
  color: #777;
}

.user-profile {
  .user-name {
    font-weight: bold;
  }

  .box-center {
    padding-top: 10px;
  }

  .user-role {
    padding-top: 10px;
    font-weight: 400;
    font-size: 14px;
  }

  .box-social {
    padding-top: 30px;

    .el-table {
      border-top: 1px solid #dfe6ec;
    }
  }

  .user-follow {
    padding-top: 20px;
  }
}

.user-bio {
  margin-top: 20px;
  color: #606266;

  span {
    padding-left: 4px;
  }

  .user-bio-section {
    font-size: 14px;
    padding: 15px 0;

    .user-bio-section-header {
      border-bottom: 1px solid #dfe6ec;
      padding-bottom: 10px;
      margin-bottom: 10px;
      font-weight: bold;
    }
  }
}

.user-details {
  margin-top: 20px;
  color: #606266;

  .user-bio-section {
    font-size: 14px;
    padding: 5px 0;

    .user-bio-section-header {
      border-bottom: 1px solid #dfe6ec;
      padding-bottom: 5px;
      margin-bottom: 5px;
      font-weight: bold;
    }

    .user-detail-item {
      padding: 5px 0;
      .strong {
        font-weight: bold;
      }
    }
  }
}
</style>
