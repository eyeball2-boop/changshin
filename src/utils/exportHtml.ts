import { Student, DEFAULT_SUBJECTS, EXAM_TERMS } from '../types';

/**
 * Creates and triggers a download of a complete, standalone, self-contained single HTML file
 * containing the full student grade database, charts, and improvement tracker.
 */
export function exportToSingleHtmlFile(students: Student[], schoolName: string = '창신중학교'): void {
  const jsonData = JSON.stringify(students, null, 2);
  const subjectsData = JSON.stringify(DEFAULT_SUBJECTS);
  const termsData = JSON.stringify(EXAM_TERMS);

  const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${schoolName} 중학생 과목별 수업 향상도 분석 리포트</title>
  <style>
    :root {
      --primary: #4f46e5;
      --primary-light: #eef2ff;
      --success: #10b981;
      --success-light: #ecfdf5;
      --danger: #ef4444;
      --border: #e2e8f0;
      --bg: #f8fafc;
      --card: #ffffff;
      --text: #1e293b;
      --text-muted: #64748b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", Roboto, sans-serif; }
    body { background-color: var(--bg); color: var(--text); padding: 24px; }
    .container { max-width: 1200px; margin: 0 auto; }
    header { background: #fff; padding: 24px; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    h1 { font-size: 24px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 10px; }
    .badge { padding: 4px 10px; border-radius: 9999px; font-size: 13px; font-weight: 600; }
    .badge-primary { background: var(--primary-light); color: var(--primary); }
    .badge-success { background: var(--success-light); color: var(--success); }
    .grid { display: grid; grid-template-columns: 280px 1fr; gap: 24px; }
    @media (max-width: 860px) { .grid { grid-template-columns: 1fr; } }
    .sidebar { background: #fff; border-radius: 16px; border: 1px solid var(--border); padding: 16px; height: fit-content; }
    .student-item { padding: 12px 16px; border-radius: 12px; margin-bottom: 8px; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; display: flex; justify-content: space-between; align-items: center; }
    .student-item:hover { background: #f1f5f9; }
    .student-item.active { background: var(--primary-light); border-color: var(--primary); font-weight: 600; color: var(--primary); }
    .card { background: #fff; border-radius: 16px; border: 1px solid var(--border); padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
    .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-box { background: #f8fafc; border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
    .stat-label { font-size: 13px; color: var(--text-muted); margin-bottom: 6px; }
    .stat-value { font-size: 24px; font-weight: 700; }
    .text-success { color: var(--success); }
    .text-danger { color: var(--danger); }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
    th, td { padding: 12px; text-align: center; border-bottom: 1px solid var(--border); }
    th { background: #f8fafc; font-weight: 600; color: var(--text-muted); }
    .grade-pill { display: inline-block; width: 28px; height: 28px; line-height: 28px; border-radius: 50%; font-weight: 700; font-size: 12px; }
    .grade-A { background: #dcfce7; color: #15803d; }
    .grade-B { background: #e0e7ff; color: #3730a3; }
    .grade-C { background: #fef3c7; color: #b45309; }
    .grade-D { background: #ffedd5; color: #c2410c; }
    .grade-E { background: #fee2e2; color: #b91c1c; }
    .chart-container { width: 100%; height: 280px; position: relative; margin: 20px 0; }
    .print-btn { background: var(--primary); color: white; border: none; padding: 10px 18px; border-radius: 10px; cursor: pointer; font-weight: 600; }
    .print-btn:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>🎓 ${schoolName} 중학생 수업 향상도 종합 리포트</h1>
        <p style="color: var(--text-muted); font-size: 14px; margin-top: 4px;">저장일시: ${new Date().toLocaleString('ko-KR')} | 오프라인 독립 실행형 단일 HTML 파일</p>
      </div>
      <div>
        <button class="print-btn" onclick="window.print()">🖨️ 인쇄 / PDF 저장</button>
      </div>
    </header>

    <div class="grid">
      <div class="sidebar">
        <h3 style="font-size: 16px; margin-bottom: 14px;">👥 학생 명단 (<span id="studentCount">0</span>명)</h3>
        <div id="studentListContainer"></div>
      </div>

      <div class="main-content">
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div>
              <h2 id="currentStudentTitle" style="font-size: 22px; font-weight: 700;">학생 정보</h2>
              <p id="currentStudentGoal" style="color: var(--primary); font-size: 14px; margin-top: 4px; font-weight: 500;"></p>
            </div>
            <div id="overallDeltaBadge"></div>
          </div>

          <div class="stats-row">
            <div class="stat-box">
              <div class="stat-label">1학기 중간고사 평균</div>
              <div class="stat-value" id="valInitialAvg">0점</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">최근 시험 평균</div>
              <div class="stat-value" id="valCurrentAvg">0점</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">학업 총 향상도 (Δ)</div>
              <div class="stat-value" id="valTotalDelta">+0점</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">최대 성장 과목</div>
              <div class="stat-value" style="color: var(--primary);" id="valTopSubject">-</div>
            </div>
          </div>

          <h3 style="font-size: 16px; margin: 20px 0 10px;">📈 과목별 성적 및 학기별 향상도 변화표</h3>
          <div style="overflow-x: auto;">
            <table id="scoresTable">
              <thead>
                <tr id="tableHeaderRow"></tr>
              </thead>
              <tbody id="tableBody"></tbody>
            </table>
          </div>

          <h3 style="font-size: 16px; margin: 24px 0 12px;">📊 과목별 누적 점수 변화 (SVG 그래프)</h3>
          <div class="chart-container" id="svgChartArea"></div>

          <div style="background: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid var(--border); margin-top: 20px;">
            <h4 style="font-size: 15px; margin-bottom: 8px;">💡 지도 교사 종합 분석 코멘트</h4>
            <p id="teacherFeedbackArea" style="font-size: 14px; line-height: 1.6; color: #334155;"></p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const students = ${jsonData};
    const subjects = ${subjectsData};
    const terms = ${termsData};

    let selectedIndex = 0;

    function getGrade(score) {
      if (score >= 90) return 'A';
      if (score >= 80) return 'B';
      if (score >= 70) return 'C';
      if (score >= 60) return 'D';
      return 'E';
    }

    function renderStudentList() {
      const container = document.getElementById('studentListContainer');
      document.getElementById('studentCount').innerText = students.length;
      container.innerHTML = '';

      students.forEach((s, idx) => {
        const item = document.createElement('div');
        item.className = 'student-item' + (idx === selectedIndex ? ' active' : '');
        
        const firstAvg = s.records[0] ? (Object.values(s.records[0].scores).reduce((a,b)=>a+b,0)/Object.values(s.records[0].scores).length) : 0;
        const lastAvg = s.records[s.records.length-1] ? (Object.values(s.records[s.records.length-1].scores).reduce((a,b)=>a+b,0)/Object.values(s.records[s.records.length-1].scores).length) : 0;
        const diff = (lastAvg - firstAvg).toFixed(1);
        const badgeColor = diff >= 0 ? 'badge-success' : 'badge-primary';

        item.innerHTML = '<div><div>' + s.name + '</div><div style="font-size: 12px; color: var(--text-muted);">' + s.grade + '학년 ' + s.classroom + '반 ' + s.number + '번</div></div>' +
          '<span class="badge ' + badgeColor + '">' + (diff >= 0 ? '+' : '') + diff + '점</span>';
        
        item.onclick = () => {
          selectedIndex = idx;
          renderStudentList();
          renderStudentDetail();
        };
        container.appendChild(item);
      });
    }

    function renderStudentDetail() {
      const s = students[selectedIndex];
      if (!s) return;

      document.getElementById('currentStudentTitle').innerText = s.grade + '학년 ' + s.classroom + '반 ' + s.number + '번 ' + s.name + ' 학생 향상도 리포트';
      document.getElementById('currentStudentGoal').innerText = '🎯 목표: ' + s.targetGoal;

      const firstRec = s.records[0];
      const lastRec = s.records[s.records.length - 1];

      const getAvg = (r) => {
        if (!r) return 0;
        const v = Object.values(r.scores);
        return v.reduce((a,b)=>a+b,0) / v.length;
      };

      const fAvg = firstRec ? getAvg(firstRec) : 0;
      const lAvg = lastRec ? getAvg(lastRec) : 0;
      const dAvg = (lAvg - fAvg).toFixed(1);

      document.getElementById('valInitialAvg').innerText = fAvg.toFixed(1) + '점';
      document.getElementById('valCurrentAvg').innerText = lAvg.toFixed(1) + '점';
      document.getElementById('valTotalDelta').innerText = (dAvg >= 0 ? '+' : '') + dAvg + '점';
      document.getElementById('valTotalDelta').className = 'stat-value ' + (dAvg >= 0 ? 'text-success' : 'text-danger');

      let maxDiff = -999;
      let topSub = '없음';
      subjects.forEach(sub => {
        const fromVal = firstRec?.scores[sub.id] || 0;
        const toVal = lastRec?.scores[sub.id] || 0;
        const diff = toVal - fromVal;
        if (diff > maxDiff) {
          maxDiff = diff;
          topSub = sub.name + ' (+' + diff + '점)';
        }
      });
      document.getElementById('valTopSubject').innerText = topSub;

      // Render table
      const headerRow = document.getElementById('tableHeaderRow');
      headerRow.innerHTML = '<th>과목</th>' + s.records.map(r => {
        const t = terms.find(x => x.id === r.termId);
        return '<th>' + (t ? t.shortName : r.termId) + '</th>';
      }).join('') + '<th>향상도 (Δ)</th><th>현재성취도</th>';

      const tbody = document.getElementById('tableBody');
      tbody.innerHTML = '';
      subjects.forEach(sub => {
        const tr = document.createElement('tr');
        const firstVal = firstRec?.scores[sub.id] ?? '-';
        const lastVal = lastRec?.scores[sub.id] ?? '-';
        const delta = (typeof lastVal === 'number' && typeof firstVal === 'number') ? (lastVal - firstVal) : 0;
        const currentGrade = typeof lastVal === 'number' ? getGrade(lastVal) : '-';

        let rowHtml = '<td style="font-weight: 600; text-align: left;">' + sub.name + '</td>';
        s.records.forEach(r => {
          const val = r.scores[sub.id] ?? '-';
          rowHtml += '<td>' + val + '점</td>';
        });

        const deltaClass = delta > 0 ? 'text-success' : delta < 0 ? 'text-danger' : '';
        const deltaText = delta > 0 ? '+' + delta : delta;
        rowHtml += '<td class="' + deltaClass + '" style="font-weight: 700;">' + deltaText + '점</td>';
        rowHtml += '<td><span class="grade-pill grade-' + currentGrade + '">' + currentGrade + '</span></td>';

        tr.innerHTML = rowHtml;
        tbody.appendChild(tr);
      });

      // SVG Trend Lines
      renderSvgChart(s);

      // Teacher feedback
      document.getElementById('teacherFeedbackArea').innerHTML =
        '<strong>[학업 성장 분석]</strong> ' + s.name + ' 학생은 ' + (terms[0]?.name || '1학기') + ' 대비 최신 시험에서 평균 <strong>' +
        (dAvg >= 0 ? '+' + dAvg : dAvg) + '점</strong>의 괄목할만한 향상을 보였습니다. 특히 <strong>' + topSub + '</strong>의 성장이 돋보이며, ' +
        (s.notes || '꾸준한 자기주도 학습 습관을 유지하고 있습니다.');
    }

    function renderSvgChart(s) {
      const area = document.getElementById('svgChartArea');
      const width = area.clientWidth || 800;
      const height = 280;
      const padding = { top: 20, right: 30, bottom: 40, left: 40 };

      const chartW = width - padding.left - padding.right;
      const chartH = height - padding.top - padding.bottom;
      const numTerms = s.records.length;

      let svg = '<svg width="100%" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '" xmlns="http://www.w3.org/2000/svg">';
      
      // Grid lines
      for (let sc = 0; sc <= 100; sc += 20) {
        const y = padding.top + chartH - (sc / 100) * chartH;
        svg += '<line x1="' + padding.left + '" y1="' + y + '" x2="' + (width - padding.right) + '" y2="' + y + '" stroke="#e2e8f0" stroke-dasharray="4"/>';
        svg += '<text x="' + (padding.left - 8) + '" y="' + (y + 4) + '" fill="#94a3b8" font-size="11" text-anchor="end">' + sc + '</text>';
      }

      // X-axis labels
      s.records.forEach((r, idx) => {
        const t = terms.find(x => x.id === r.termId);
        const x = padding.left + (idx / Math.max(1, numTerms - 1)) * chartW;
        svg += '<text x="' + x + '" y="' + (height - 12) + '" fill="#64748b" font-size="12" text-anchor="middle">' + (t ? t.shortName : r.termId) + '</text>';
      });

      // Draw lines for top 5 subjects
      subjects.slice(0, 5).forEach(sub => {
        const points = [];
        s.records.forEach((r, idx) => {
          const val = r.scores[sub.id] || 0;
          const x = padding.left + (idx / Math.max(1, numTerms - 1)) * chartW;
          const y = padding.top + chartH - (val / 100) * chartH;
          points.push({ x, y, val });
        });

        if (points.length > 1) {
          const pathD = points.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ' ' + p.y).join(' ');
          svg += '<path d="' + pathD + '" fill="none" stroke="' + sub.color + '" stroke-width="3" stroke-linecap="round"/>';
        }

        points.forEach(p => {
          svg += '<circle cx="' + p.x + '" cy="' + p.y + '" r="5" fill="#fff" stroke="' + sub.color + '" stroke-width="2"/>';
        });
      });

      svg += '</svg>';
      area.innerHTML = svg;
    }

    renderStudentList();
    renderStudentDetail();
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `중학생_수업향상도_데이터베이스_${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
