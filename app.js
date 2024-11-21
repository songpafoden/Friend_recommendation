document.getElementById('friendForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // 폼 제출 기본 동작 방지

    // 사용자 입력 데이터를 객체로 생성
    let userInfo = {
        name: document.getElementById('name').value,
        student_id: document.getElementById('student_id').value,
        gender: document.getElementById('gender').value,
        military_status: document.getElementById('military_status').value,
        age: parseInt(document.getElementById('age').value),
        department: document.getElementById('department').value,
        hobby: document.getElementById('hobby').value,
        mbti: document.getElementById('mbti').value
    };

    // 학생 데이터 로드
    let students;
    try {
        const response = await fetch('students.json');
        students = await response.json();
    } catch (error) {
        console.error('Error loading students data:', error);
        alert('학생 데이터를 로드하는 중 오류가 발생했습니다.');
        return;
    }

    // 호환성 계산 함수 정의
    function calculateCompatibility(person1, person2) {
        let score = 0;
        let details = [];

        // 나이 차이에 따른 점수
        const ageDiff = Math.abs(person1.age - person2.age);
        if (ageDiff === 0) {
            score += 5;
            details.push('나이 동일: +5점');
        } else if (ageDiff === 1) {
            score += 3;
            details.push('나이 차이 1살: +3점');
        } else if (ageDiff === 2) {
            score += 1;
            details.push('나이 차이 2살: +1점');
        }

        // MBTI 점수 계산 (16x16 매트릭스 기반)
        const mbtiTypes = ["INTJ", "INTP", "INFJ", "INFP", "ENTJ", "ENTP", "ENFJ", "ENFP", "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP"];
        const mbtiAffinity = [
            [3,  2,  1,  1,  3,  3,  2,  3,  0,  0, -1, -2, -3, -3, -3, -3],  // INTJ
            [2,  3,  0,  2,  3,  3,  1,  3, -1, -1, -2, -2, -3, -3, -3, -3],  // INTP
            [1,  0,  3,  2,  3,  3,  3,  3, -1,  0, -1, -2, -2, -3, -3, -3],  // INFJ
            [1,  2,  2,  3,  2,  3,  3,  3,  0,  0, -1, -2, -3, -3, -3, -3],  // INFP
            [3,  3,  3,  2,  3,  3,  3,  3, -1, -1, -2, -2, -2, -3, -3, -3],  // ENTJ
            [3,  3,  3,  3,  3,  3,  3,  3,  0, -1, -1, -2, -3, -3, -3, -3],  // ENTP
            [2,  1,  3,  3,  3,  3,  3,  3, -1,  0,  0, -1, -2, -2, -3, -3],  // ENFJ
            [3,  3,  3,  3,  3,  3,  3,  3, -1,  0, -1, -2, -3, -3, -3, -3],  // ENFP
            [0, -1, -1,  0, -1,  0, -1, -1,  3,  2,  1,  1,  3,  2,  1,  0],  // ISTJ
            [0, -1,  0,  0, -1, -1,  0,  0,  2,  3,  1,  2,  3,  3,  2,  1],  // ISFJ
            [-1, -2, -1, -1, -2, -1,  0, -1,  1,  1,  3,  2,  3,  2,  3,  2],  // ESTJ
            [-2, -2, -2, -2, -2, -2, -1, -2,  1,  2,  2,  3,  2,  3,  2,  3],  // ESFJ
            [-3, -3, -2, -3, -2, -3, -2, -3,  3,  3,  3,  2,  3,  2,  3,  2],  // ISTP
            [-3, -3, -3, -3, -3, -3, -2, -3,  2,  3,  2,  3,  2,  3,  2,  3],  // ISFP
            [-3, -3, -3, -3, -3, -3, -3, -3,  1,  2,  3,  2,  3,  2,  3,  3],  // ESTP
            [-3, -3, -3, -3, -3, -3, -3, -3,  0,  1,  2,  3,  2,  3,  3,  3]   // ESFP
        ];

        const mbtiIndex1 = mbtiTypes.indexOf(person1.mbti);
        const mbtiIndex2 = mbtiTypes.indexOf(person2.mbti);
        const mbtiScore = mbtiAffinity[mbtiIndex1][mbtiIndex2];
        score += mbtiScore;
        details.push(`MBTI 궁합: ${mbtiScore}점`);

        // 같은 전공 점수
        if (person1.department === person2.department) {
            score += 5;
            details.push('같은 전공: +5점');
        }

        // 같은 취미 점수
        if (person1.hobby === person2.hobby) {
            score += 15;
            details.push('같은 취미: +15점');
        } else {
            // 같은 그룹 내에 있는 취미인지 확인
            const sports = ["축구", "헬스", "캠핑", "클라이밍", "등산", "농구", "배드민턴", "자전거타기", "운동", "춤"];
            const games = ["게임", "롤", "배틀그라운드", "오버워치", "피파"];
            const arts = ["음악감상", "악기연주", "미술", "밴드"];
            const leisure = ["여행", "사진촬영", "드라마감상", "영화감상"];
            const others = ["요리", "독서"];

            const hobbyGroups = [sports, games, arts, leisure, others];
            let inSameGroup = false;
            for (let group of hobbyGroups) {
                if (group.includes(person1.hobby) && group.includes(person2.hobby)) {
                    inSameGroup = true;
                    break;
                }
            }

            if (inSameGroup) {
                score += 8;
                details.push('같은 그룹의 취미: +8점');
            }
        }

        // 둘 다 군필인 경우 점수 추가
        if (person1.military_status === "군필" && person2.military_status === "군필") {
            score += 5;
            details.push('둘 다 군필: +5점');
        }

        // 성별이 둘 다 여자일 경우 점수 추가
        if (person1.gender === "여자" && person2.gender === "여자") {
            score += 3;
            details.push('둘 다 여자: +3점');
        }

        return { score, details };
    }

    // 최적의 매치 10명 찾기
    let matches = students.map(student => {
        const { score, details } = calculateCompatibility(userInfo, student);
        return {
            name: student.name,
            student_id: student.student_id,
            score: score,
            details: details,
            age: student.age,
            gender: student.gender,
            mbti: student.mbti,
            department: student.department,
            hobby: student.hobby,
            military_status: student.military_status
        };
    });

    matches.sort((a, b) => b.score - a.score);
    let bestMatches = matches.slice(0, 10);

    // localStorage에 추천 친구 데이터 저장
    localStorage.setItem('bestMatches', JSON.stringify(bestMatches));

    // 추천 결과 페이지로 이동
    window.location.href = 'out.html';
});
