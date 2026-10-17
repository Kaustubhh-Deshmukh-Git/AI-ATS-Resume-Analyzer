/**
 * Golden test pairs containing resume and job description text
 * with expected scores (within tolerance) and expected keywords.
 */
export const goldenPairs = [
  {
    name: 'Full Stack Engineer - High Match',
    resumeText: `
      Sarah Connor - Senior Full Stack Engineer
      Email: sarah@example.com | Phone: (555) 019-2834 | San Francisco, CA | github.com/sconnor
      
      Professional Summary:
      Accomplished Full Stack Software Engineer with 7+ years of experience designing and scaling web applications.
      Expert in TypeScript, React, Node.js, Express, and PostgreSQL with a strong focus on distributed microservices.
      
      Technical Skills:
      - Languages: TypeScript, JavaScript, SQL, HTML5, CSS3, Python
      - Frameworks: React, Node.js, Express, Next.js, Redux, Vitest, Jest
      - Cloud & Databases: PostgreSQL, MongoDB, Redis, Docker, Kubernetes, AWS, CI/CD
      
      Professional Experience:
      Senior Software Engineer | Apex Systems | 2021 - Present
      - Architected and delivered event-driven microservices serving 1.5M daily active users with 99.98% uptime.
      - Reduced API response latency by 42% through query optimization and Redis distributed caching.
      - Automated CI/CD deployment pipelines using GitHub Actions and Docker, reducing release cycle by 50%.
      
      Software Engineer | BaseCamp Tech | 2018 - 2021
      - Built interactive responsive UI components with React, TypeScript, and Tailwind CSS.
      - Developed REST APIs in Node.js and Express handling 500k monthly transactions.
      - Spearheaded unit and integration testing achieving 92% test coverage with Jest.
      
      Education:
      Bachelor of Science in Computer Science | University of Washington | 2014 - 2018
    `.trim(),
    jobDescription: `
      We are looking for a Senior Full Stack Engineer to join our core product team.
      Requirements:
      - 5+ years of experience building modern web applications with React, TypeScript, and Node.js.
      - Strong experience with Express, REST APIs, and relational databases (PostgreSQL preferred).
      - Hands-on experience with Docker, AWS, and CI/CD automation.
      - Proven ability to write comprehensive unit and integration tests (Jest or Vitest).
      - Excellent problem solving, leadership, and communication skills.
    `.trim(),
    expectedScoreMin: 70,
    expectedScoreMax: 95,
    expectedMatchedSkills: ['react', 'typescript', 'node.js', 'express', 'postgresql', 'docker', 'aws', 'ci/cd'],
  },
  {
    name: 'Frontend Developer vs DevOps/Cloud Engineer - Low Match',
    resumeText: `
      John Doe - Frontend Developer
      Email: john.doe@example.com | Phone: (555) 987-6543 | New York, NY
      
      Summary:
      Junior frontend developer with 2 years of experience crafting interactive web user interfaces using HTML, CSS, JavaScript, and Vue.
      
      Skills:
      HTML5, CSS3, JavaScript, Vue, Bootstrap, Figma, Git
      
      Experience:
      Frontend Web Developer | PixelStudio | 2022 - Present
      - Built landing pages and promotional marketing sites using Vue and Bootstrap.
      - Enhanced mobile responsiveness for 15+ client web projects.
      
      Education:
      Associate Degree in Web Development | Brooklyn College | 2020 - 2022
    `.trim(),
    jobDescription: `
      Senior DevOps & Site Reliability Engineer (SRE).
      Key Requirements:
      - Extensive experience managing infrastructure on AWS and Kubernetes (EKS).
      - Proficient in Terraform, Ansible, and Helm for Infrastructure as Code (IaC).
      - Strong background in Linux administration, Bash, and Python scripting.
      - Experience with Prometheus, Grafana, Datadog monitoring and Kafka streaming pipelines.
      - Deep understanding of networking, SSL/TLS, DNS, and CI/CD with GitLab CI.
    `.trim(),
    expectedScoreMin: 15,
    expectedScoreMax: 45,
    expectedMissingSkills: ['kubernetes', 'terraform', 'aws', 'linux', 'python', 'prometheus', 'grafana', 'kafka'],
  },
  {
    name: 'Data Scientist / ML Engineer - High Match',
    resumeText: `
      Dr. Elena Rostova - Machine Learning Engineer
      Email: elena.rostova@example.com | Phone: (555) 432-8765 | Boston, MA | linkedin.com/in/elenarostova
      
      Professional Summary:
      Machine Learning Engineer and Data Scientist with 5 years of industry experience developing and deploying deep learning, NLP, and computer vision models in production.
      
      Skills:
      - Languages & Tools: Python, SQL, R, Git, Docker, Linux
      - Machine Learning: Machine Learning, Deep Learning, NLP, PyTorch, TensorFlow, Scikit-learn, Hugging Face
      - Data Engineering: Pandas, NumPy, Spark, PySpark, Airflow, PostgreSQL
      
      Experience:
      Lead ML Engineer | NeuralInsights | 2021 - Present
      - Designed and fine-tuned Transformer-based NLP models with PyTorch and Hugging Face, boosting F1-score by 18%.
      - Deployed scalable model inference microservices in Docker on AWS, handling 20M+ predictions daily.
      - Built automated ETL data pipelines using PySpark and Airflow to process 4TB of weekly data.
      
      Data Scientist | DataWave Corp | 2019 - 2021
      - Trained predictive machine learning models using Scikit-learn and XGBoost for customer churn prediction.
      - Increased user retention by 14% through data-driven recommendations.
      
      Education:
      Ph.D. in Computer Science (Machine Learning Focus) | MIT | 2015 - 2019
    `.trim(),
    jobDescription: `
      We are hiring a Machine Learning Engineer to build cutting-edge artificial intelligence solutions.
      Requirements:
      - Strong proficiency in Python and SQL.
      - Demonstrated experience training deep learning and NLP models using PyTorch or TensorFlow.
      - Experience with Scikit-learn, Pandas, NumPy, and Hugging Face.
      - Familiarity with data pipelines, Apache Spark, and Docker containerization.
      - Strong analytical thinking and collaborative teamwork skills.
    `.trim(),
    expectedScoreMin: 70,
    expectedScoreMax: 95,
    expectedMatchedSkills: ['python', 'sql', 'machine learning', 'deep learning', 'nlp', 'pytorch', 'tensorflow', 'scikit-learn', 'pandas', 'numpy', 'docker'],
  },
];

export default goldenPairs;
