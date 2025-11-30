// Main application logic
let currentScreen = 'home-screen';
let currentQuestion = 0;
let currentTest = '';
let testAnswers = [];

// Screen management
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
  currentScreen = screenId;
}

// Authentication checks
function requireAuth(callback) {
  if (!auth.isLoggedIn()) {
    showMessage('Please sign in to continue', 'info');
    openLogin();
    return false;
  }
  callback();
  return true;
}

// Navigation functions
function openLogin() {
  showScreen('login-screen');
}

function goHome() {
  showScreen('home-screen');
}

function goDash() {
  requireAuth(() => showScreen('dashboard-screen'));
}

// Form switching
function showForm(formType, event) {
  if (event) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
  }
  
  document.querySelectorAll('.form').forEach(form => form.classList.remove('active'));
  document.getElementById(formType).classList.add('active');
}

// Assessment functions
function startAssessment(type) {
  requireAuth(() => {
    currentTest = type;
    currentQuestion = 0;
    testAnswers = [];
    showScreen('assessment-screen');
    loadQuestion();
  });
}

function loadQuestion() {
  const questions = {
    personality: [
      { 
        text: "What type of work environment do you enjoy the most?", 
        options: ["Quiet and structured", "Fast-paced and energetic", "Creative and flexible", "Team-based and collaborative"] 
      },
      { 
        text: "Which task do you naturally prefer?", 
        options: ["Solving logical problems", "Helping or guiding people", "Designing or creating something new", "Organizing and managing tasks"] 
      },
      { 
        text: "How do you make decisions?", 
        options: ["Based on data and facts", "Based on feelings and impact on others", "Based on creativity and new ideas", "Based on rules and past experience"] 
      },
      { 
        text: "What motivates you the most at work?", 
        options: ["Achieving goals and results", "Supporting others' growth", "Freedom to experiment", "Stability and clear expectations"] 
      },
      { 
        text: "How do you prefer to work?", 
        options: ["Independently", "With a small team", "Leading a team", "Switching between solo and team work"] 
      }
    ],
    skills: [
      { text: "I am comfortable with technology", options: ["Very Comfortable", "Comfortable", "Neutral", "Uncomfortable", "Very Uncomfortable"] },
      { text: "I enjoy solving complex problems", options: ["Love It", "Like It", "Neutral", "Dislike It", "Hate It"] }
    ],
    interests: [
      { text: "I prefer creative work over analytical work", options: ["Strongly Prefer Creative", "Prefer Creative", "No Preference", "Prefer Analytical", "Strongly Prefer Analytical"] }
    ]
  };

  const currentQuestions = questions[currentTest] || [];
  if (currentQuestion >= currentQuestions.length) {
    if (currentTest === 'personality') {
      showPersonalityResults();
    } else {
      submitTest();
    }
    return;
  }

  const question = currentQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / currentQuestions.length) * 100;
  
  document.getElementById('test-title').textContent = `${currentTest.charAt(0).toUpperCase() + currentTest.slice(1)} Assessment`;
  document.getElementById('progress-fill').style.width = progress + '%';
  
  document.getElementById('question-area').innerHTML = `
    <div class="question-card">
      <div class="q-header">Question ${currentQuestion + 1} of ${currentQuestions.length}</div>
      <div class="q-text">${question.text}</div>
      <div class="options">
        ${question.options.map((option, index) => `
          <div class="option" onclick="selectOption(${index})">${option}</div>
        `).join('')}
      </div>
    </div>
  `;
}

function selectOption(index) {
  document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
  document.querySelectorAll('.option')[index].classList.add('selected');
  testAnswers[currentQuestion] = index;
}

function nextQuestion() {
  if (testAnswers[currentQuestion] === undefined) {
    showMessage('Please select an answer', 'error');
    return;
  }
  currentQuestion++;
  loadQuestion();
}

function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    loadQuestion();
  }
}

function submitTest() {
  showMessage('Assessment completed!', 'success');
  setTimeout(() => {
    showScreen('dashboard-screen');
  }, 1500);
}

function showPersonalityResults() {
  const recommendations = generateCareerRecommendation(testAnswers);
  
  document.getElementById('question-area').innerHTML = `
    <div class="results-card">
      <h3>🎯 Your Career Personality Results</h3>
      
      <div class="personality-type">
        <h4>Your Personality Type:</h4>
        <p><strong>${recommendations.personalityType}</strong></p>
      </div>
      
      <div class="top-careers">
        <h4>Top 5 Suitable Careers:</h4>
        <ol>
          ${recommendations.careers.map(career => `
            <li>
              <strong>${career.title}</strong>
              <p>${career.explanation}</p>
            </li>
          `).join('')}
        </ol>
      </div>
      
      <div class="skills-develop">
        <h4>Skills You Should Develop:</h4>
        <ul>
          ${recommendations.skills.map(skill => `<li>${skill}</li>`).join('')}
        </ul>
      </div>
      
      <div class="ideal-job">
        <h4>Ideal Job Role to Start With:</h4>
        <p><strong>${recommendations.idealJob.title}</strong></p>
        <p>${recommendations.idealJob.description}</p>
      </div>
    </div>
  `;
  
  document.getElementById('next-btn').style.display = 'none';
  document.getElementById('submit-btn').style.display = 'inline-flex';
  document.getElementById('submit-btn').textContent = 'Back to Dashboard';
}

function generateCareerRecommendation(answers) {
  // Analyze answers to determine personality type and recommendations
  const profiles = {
    analytical: {
      personalityType: "Analytical Thinker",
      careers: [
        { title: "Data Scientist", explanation: "Perfect for logical problem-solving and data-driven decision making" },
        { title: "Software Engineer", explanation: "Ideal for structured thinking and technical problem solving" },
        { title: "Financial Analyst", explanation: "Great for analytical minds who enjoy working with numbers" },
        { title: "Research Scientist", explanation: "Excellent for methodical investigation and fact-based conclusions" },
        { title: "Business Analyst", explanation: "Combines analytical skills with business understanding" }
      ],
      skills: ["Data Analysis", "Critical Thinking", "Statistical Methods", "Programming", "Research Methods"],
      idealJob: {
        title: "Junior Data Analyst",
        description: "Start by analyzing data patterns and creating reports to build your analytical foundation."
      }
    },
    creative: {
      personalityType: "Creative Innovator",
      careers: [
        { title: "UX/UI Designer", explanation: "Perfect for creative problem-solving in digital experiences" },
        { title: "Marketing Manager", explanation: "Ideal for creative campaign development and brand building" },
        { title: "Product Designer", explanation: "Great for innovative thinking and user-centered design" },
        { title: "Content Creator", explanation: "Excellent for expressing creativity through various media" },
        { title: "Art Director", explanation: "Combines creativity with leadership in visual communications" }
      ],
      skills: ["Design Thinking", "Creative Software", "Visual Communication", "Storytelling", "Brand Development"],
      idealJob: {
        title: "Junior Graphic Designer",
        description: "Start creating visual content to build your creative portfolio and design skills."
      }
    },
    collaborative: {
      personalityType: "Team Collaborator",
      careers: [
        { title: "Project Manager", explanation: "Perfect for coordinating teams and managing collaborative efforts" },
        { title: "HR Manager", explanation: "Ideal for supporting people and building team culture" },
        { title: "Sales Manager", explanation: "Great for building relationships and working with diverse teams" },
        { title: "Training Coordinator", explanation: "Excellent for helping others grow and develop" },
        { title: "Customer Success Manager", explanation: "Combines people skills with problem-solving" }
      ],
      skills: ["Team Leadership", "Communication", "Conflict Resolution", "Emotional Intelligence", "Project Management"],
      idealJob: {
        title: "Team Coordinator",
        description: "Start by supporting team projects and learning collaboration tools."
      }
    },
    organized: {
      personalityType: "Organized Planner",
      careers: [
        { title: "Operations Manager", explanation: "Perfect for systematic thinking and process optimization" },
        { title: "Administrative Manager", explanation: "Ideal for structured environments and organizational systems" },
        { title: "Quality Assurance Specialist", explanation: "Great for detail-oriented and systematic work" },
        { title: "Supply Chain Manager", explanation: "Excellent for coordinating complex logistics" },
        { title: "Executive Assistant", explanation: "Combines organization with executive support" }
      ],
      skills: ["Process Improvement", "Time Management", "Attention to Detail", "Systems Thinking", "Documentation"],
      idealJob: {
        title: "Administrative Assistant",
        description: "Start by managing schedules and processes to build organizational expertise."
      }
    }
  };
  
  // Simple logic to determine personality type based on most common answers
  const answerCounts = [0, 0, 0, 0];
  answers.forEach(answer => answerCounts[answer]++);
  
  const maxIndex = answerCounts.indexOf(Math.max(...answerCounts));
  const profileKeys = ['analytical', 'collaborative', 'creative', 'organized'];
  
  return profiles[profileKeys[maxIndex]] || profiles.analytical;
}

// Career data
const careerData = [
  {
    id: 'python_developer',
    title: 'Python Developer',
    category: 'Technology',
    description: 'Builds web applications, data analysis tools, and automation scripts using Python.',
    requiredSkills: ['Python','Django/Flask','SQL','APIs'],
    tools: ['PyCharm','Jupyter','Git','PostgreSQL'],
    education: 'BSc Computer Science / Bootcamp',
    growth: 'High',
    salary: '$65k-$120k',
    courses: ['https://www.python.org/about/gettingstarted/','https://www.udemy.com/course/complete-python-bootcamp/'],
    icon: '🐍'
  },
  {
    id: 'uiux_designer',
    title: 'UI/UX Designer',
    category: 'Design',
    description: 'Designs user-friendly interfaces and experiences with research-led workflows.',
    requiredSkills: ['Wireframing','Prototyping','Design thinking'],
    tools: ['Figma','Adobe XD'],
    education: 'Design degree / Portfolio',
    growth: 'High',
    salary: '$50k-$95k',
    courses: ['https://www.interaction-design.org','https://www.udemy.com/topic/ux-design/'],
    icon: '🎨'
  },
  {
    id: 'web_dev',
    title: 'Web Developer',
    category: 'Technology',
    description: 'Creates and maintains websites using front-end and back-end technologies.',
    requiredSkills: ['HTML','CSS','JavaScript','React'],
    tools: ['Chrome DevTools','Node.js'],
    education: 'Diploma/Degree + Projects',
    growth: 'High',
    salary: '$55k-$110k',
    courses: ['https://www.codecademy.com','https://www.freecodecamp.org'],
    icon: '🌐'
  },
  {
    id: 'mobile_dev',
    title: 'Mobile App Developer',
    category: 'Technology',
    description: 'Builds Android and iOS applications using native or cross-platform tools.',
    requiredSkills: ['Flutter','Kotlin','Swift'],
    tools: ['Android Studio','Xcode','Flutter'],
    education: 'BSc / Certifications / Portfolio',
    growth: 'High',
    salary: '$65k-$130k',
    courses: ['https://flutter.dev/docs','https://developer.android.com/courses'],
    icon: '📱'
  },
  {
    id: 'data_analyst',
    title: 'Data Analyst',
    category: 'Data',
    description: 'Analyzes data to produce insights for business decisions.',
    requiredSkills: ['Data Analysis','Programming','SQL'],
    tools: ['Python','Pandas','Tableau'],
    education: 'BSc Data Science / Statistics',
    growth: 'High',
    salary: '$60k-$110k',
    courses: ['https://www.coursera.org','https://www.edx.org'],
    icon: '📊'
  },
  {
    id: 'ux_designer',
    title: 'UX Researcher',
    category: 'Design',
    description: 'Conducts user research to inform product and design decisions.',
    requiredSkills: ['User Research','Usability Testing','Interviews'],
    tools: ['Lookback','UserTesting'],
    education: 'Psychology / HCI / Design',
    growth: 'Medium',
    salary: '$50k-$95k',
    courses: ['https://www.interaction-design.org'],
    icon: '🔍'
  },
  {
    id: 'project_manager',
    title: 'Project Manager',
    category: 'Management',
    description: 'Coordinates teams and ensures projects are delivered on time.',
    requiredSkills: ['Communication','Leadership','Planning'],
    tools: ['Jira','Trello'],
    education: 'Any degree + certs',
    growth: 'Medium',
    salary: '$65k-$120k',
    courses: ['https://www.pmi.org'],
    icon: '📈'
  },
  {
    id: 'devops_engineer',
    title: 'DevOps Engineer',
    category: 'Technology',
    description: 'Implements CI/CD pipelines and cloud infrastructure automation.',
    requiredSkills: ['CI/CD','Scripting','Cloud'],
    tools: ['Docker','Kubernetes','AWS'],
    education: 'BSc / Certifications',
    growth: 'High',
    salary: '$80k-$150k',
    courses: ['https://www.aws.training','https://www.udemy.com/topic/devops/'],
    icon: '⚙️'
  },
  {
    id: 'qa_engineer',
    title: 'QA Engineer',
    category: 'Quality',
    description: 'Ensures software quality through testing and automation.',
    requiredSkills: ['Testing','Automation','Attention to detail'],
    tools: ['Selenium','Cypress'],
    education: 'Degree / Certifications',
    growth: 'Medium',
    salary: '$45k-$90k',
    courses: ['https://www.udemy.com/topic/software-testing/'],
    icon: '🧪'
  },
  {
    id: 'data_scientist',
    title: 'Data Scientist',
    category: 'Data',
    description: 'Builds models to extract insights and predictions from data.',
    requiredSkills: ['Machine Learning','Statistics','Programming'],
    tools: ['Python','scikit-learn','TensorFlow'],
    education: 'MSc / BSc Data Science',
    growth: 'High',
    salary: '$90k-$160k',
    courses: ['https://www.coursera.org/specializations/machine-learning'],
    icon: '🤖'
  },
  {
    id: 'css_developer',
    title: 'CSS Developer',
    category: 'Technology',
    description: 'Specializes in creating beautiful, responsive user interfaces using advanced CSS techniques.',
    requiredSkills: ['CSS3','Sass/SCSS','Responsive Design','Animation'],
    tools: ['VS Code','Chrome DevTools','Figma'],
    education: 'Diploma/Degree + Portfolio',
    growth: 'High',
    salary: '$45k-$85k',
    courses: ['https://www.freecodecamp.org/learn/responsive-web-design/','https://www.udemy.com/course/advanced-css-and-sass/'],
    icon: '🎨'
  },
  {
    id: 'java_developer',
    title: 'Java Developer',
    category: 'Technology',
    description: 'Develops enterprise applications and backend systems using Java programming language.',
    requiredSkills: ['Java','Spring Framework','SQL','REST APIs'],
    tools: ['IntelliJ IDEA','Maven','Git','MySQL'],
    education: 'BSc Computer Science / Engineering',
    growth: 'High',
    salary: '$70k-$130k',
    courses: ['https://www.oracle.com/java/technologies/javase-training.html','https://www.udemy.com/course/java-the-complete-java-developer-course/'],
    icon: '☕'
  }
];

// Career explorer
function openAllCareers() {
  requireAuth(() => {
    showScreen('career-explorer-screen');
    renderCareers();
  });
}

function renderCareers() {
  const careerList = document.querySelector('.career-list');
  if (!careerList) return;
  
  careerList.innerHTML = careerData.map(career => `
    <div class="career-card">
      <div class="career-card-top">
        <div class="career-icon">${career.icon}</div>
        <div class="career-head">
          <h3>${career.title}</h3>
          <div class="career-meta">${career.category} • ${career.salary}</div>
        </div>
      </div>
      <p class="career-desc">${career.description}</p>
      <div class="career-small"><strong>Skills:</strong> ${career.requiredSkills.join(', ')}</div>
      <div class="career-small"><strong>Tools:</strong> ${career.tools.join(', ')}</div>
      <div class="career-small"><strong>Education:</strong> ${career.education}</div>
      <div class="career-actions">
        <button class="btn small" onclick="viewCareerDetails('${career.id}')">View Details</button>
        <button class="btn small outline" onclick="window.open('${career.courses[0]}', '_blank')">Course</button>
      </div>
    </div>
  `).join('');
}

function viewCareerDetails(careerId) {
  const career = careerData.find(c => c.id === careerId);
  if (!career) return;
  
  const modal = document.createElement('div');
  modal.className = 'career-modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="career-modal-inner">
      <button class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
      <h2>${career.icon} ${career.title}</h2>
      <p><strong>Category:</strong> ${career.category}</p>
      <p><strong>Salary Range:</strong> ${career.salary}</p>
      <p><strong>Growth Potential:</strong> ${career.growth}</p>
      <h3>Description</h3>
      <p>${career.description}</p>
      <h3>Required Skills</h3>
      <ul>${career.requiredSkills.map(skill => `<li>${skill}</li>`).join('')}</ul>
      <h3>Tools & Technologies</h3>
      <ul>${career.tools.map(tool => `<li>${tool}</li>`).join('')}</ul>
      <h3>Education Requirements</h3>
      <p>${career.education}</p>
      <h3>Learning Resources</h3>
      <ul>${career.courses.map(course => `<li><a href="${course}" target="_blank">${course}</a></li>`).join('')}</ul>
    </div>
  `;
  document.body.appendChild(modal);
}

// Feedback system
function openFeedbackModal() {
  document.querySelector('.feedback-modal').style.display = 'flex';
}

function closeFeedbackModal() {
  document.querySelector('.feedback-modal').style.display = 'none';
}

// Update dashboard with user info
function updateDashboard() {
  const user = auth.getCurrentUser();
  if (user) {
    const dashTitle = document.querySelector('#dash-container h1');
    if (dashTitle) {
      dashTitle.textContent = `Welcome back, ${user.name}!`;
    }
    
    // Show admin panel if user is admin
    if (auth.isAdmin(user.email)) {
      showAdminPanel();
    }
  }
}

// Admin panel functions
function showAdminPanel() {
  const dashContainer = document.querySelector('#dash-container');
  const adminPanel = document.createElement('div');
  adminPanel.className = 'admin-panel';
  adminPanel.innerHTML = `
    <div class="admin-box">
      <h3>🔧 Admin Panel</h3>
      <p>Manage user signups and platform notifications</p>
      <button class="btn small" onclick="showUserNotifications()">View User Signups</button>
    </div>
  `;
  dashContainer.insertBefore(adminPanel, dashContainer.firstChild);
}

function showUserNotifications() {
  const notifications = auth.getAdminNotifications();
  const unread = notifications.filter(n => !n.read);
  
  const modal = document.createElement('div');
  modal.className = 'career-modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="career-modal-inner">
      <button class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
      <h2>📧 User Signups (${unread.length} new)</h2>
      <div style="max-height: 400px; overflow-y: auto;">
        ${notifications.length === 0 ? '<p>No signups yet.</p>' : 
          notifications.slice().reverse().map(n => `
            <div class="notification-item" style="padding: 12px; border-bottom: 1px solid #eee; ${!n.read ? 'background: #f0f8ff;' : ''}">
              <strong>${n.user.name}</strong> (${n.user.email})<br>
              <small>Signed up: ${new Date(n.timestamp).toLocaleString()}</small>
              ${!n.read ? '<span style="color: #0055ff; font-weight: bold;"> • NEW</span>' : ''}
            </div>
          `).join('')
        }
      </div>
      <div style="margin-top: 16px; text-align: right;">
        <button class="btn outline" onclick="markAllRead()">Mark All Read</button>
        <button class="btn" onclick="this.parentElement.parentElement.parentElement.remove()">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function markAllRead() {
  const notifications = auth.getAdminNotifications();
  notifications.forEach(n => n.read = true);
  localStorage.setItem('admin_notifications', JSON.stringify(notifications));
  showMessage('All notifications marked as read', 'success');
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  if (auth.isLoggedIn()) {
    showScreen('dashboard-screen');
    updateDashboard();
  } else {
    showScreen('home-screen');
  }
});