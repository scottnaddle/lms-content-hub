
/**
 * SCORM 데이터 타입 정의
 */
export interface ScormData {
  cmi: {
    core: {
      lesson_status: string;
      lesson_location: string;
      score: {
        raw: number;
        min: number;
        max: number;
      };
      total_time: string;
      session_time: string;
      student_name: string;
      student_id: string;
      exit: string;
    };
    suspend_data: string;
    comments: string;
    objectives: any;
    student_data: {
      mastery_score: string;
      max_time_allowed: string;
      time_limit_action: string;
    };
    interactions: any[];
    completion_status: string;
    progress_measure: number;
    score: {
      raw: number;
      min: number;
      max: number;
      scaled: number;
    };
    success_status: string;
    session_time: string;
    total_time: string;
  };
  sco_data: any;
}

/**
 * 기본 SCORM 데이터 상태 생성
 */
export const createDefaultScormData = (): ScormData => ({
  cmi: {
    core: {
      lesson_status: 'incomplete',
      lesson_location: '',
      score: { raw: 0, min: 0, max: 100 },
      total_time: '0000:00:00',
      session_time: '0000:00:00',
      student_name: '학습자',
      student_id: 'student_001',
      exit: ''
    },
    suspend_data: '',
    comments: '',
    objectives: {},
    student_data: {
      mastery_score: '',
      max_time_allowed: '',
      time_limit_action: ''
    },
    interactions: [],
    completion_status: 'incomplete',
    progress_measure: 0,
    score: {
      raw: 0,
      min: 0,
      max: 100,
      scaled: 0
    },
    success_status: 'unknown',
    session_time: '0000:00:00',
    total_time: '0000:00:00'
  },
  sco_data: {}
});
