# Learn AI
## Project Description
LearnAI is a web-based educational platform designed to address the challenge of providing personalized assistance to students while easing the burden on instructors. Traditional teaching methods often fall short in offering individualized support due to time and resource constraints. LearnAI leverages AI to bridge this gap, delivering personalized feedback on student assignments and enhancing the overall learning experience.

Instructors can create and manage courses, create learning activities, view student submissions and enroll students. Students can access course and learning activities, receive AI-generated feedback on their answers, and iterate on their responses until they are ready to submit. The goal of LearnAI is to provide personalized feedback, streamline the educational process, and improve overall learning outcomes.

## Features

### Instructor Portal
- **Course Management**: Instructors can create and manage courses.
- **Activity Creation**: Instructors can create learning activities tailored to their curriculum. A learning activity consists of a question, an ideal answer and potentially additional material that the instructor provides.
- **Student Enrollment**: Instructors can enroll students in their courses.
- **View Student Submissions**: Instructors can view and assess student submissions.

### Student Portal
- **Access Courses and Activities**: Students can access their enrolled courses and assigned learning activities.
- **Receive AI Feedback**: Personalized, AI-generated feedback helps students improve their understanding and performance.
- **Receive Instructor Feedback**: Final feedback from instructors ensures comprehensive evaluation and guidance.

### AI Feedback API

Our AI Feedback API is built using Langchain and OpenAI's GPT model. it is designed to help students by guiding them towards the correct answers instead of giving it away directly. This fosters critical thinking and better understanding.

#### How It Works
1. **Prompt Engineering**:
   - Prompts are designed to compare the student’s answer with the ideal answer, nudging students in the right direction.
2. **Comparison**:
   - The system compares the student’s answer, the ideal answer, and the AI-generated feedback to ensure relevance.
3. **Text Preprocessing**:
   - Answers are cleaned and preprocessed by lowercasing, removing punctuation and stop words, and tokenizing.
4. **Embeddings**:
   - BERT (from Hugging Face) converts text into vector embeddings to capture meaning.
5. **Cosine Similarity**:
   - Uses cosine similarity to measure how close the student’s answer is to the ideal answer, guiding the AI feedback.

This process provides personalized feedback, helping students learn and easing the instructor's workload.

### User-Friendly Frontend
- **React and MUI**: The platform's frontend is built with React and styled using the MUI component library, offering a consistent and engaging user experience.

## Installation

To set up the project locally, follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/sarthak7awasthi/SeniorDesign.git 
cd SeniorDesign
```

### 2. Install Dependencies

#### Backend
Navigate to the **backend** folder and install the necessary dependencies:
```bash
cd backend
npm install
```

#### Frontend
Navigate to the **senior design** folder and install the necessary dependencies:
```bash
cd ../senior design
npm install
```

## Usage

### Start the servers

In the **backend** folder, start the server
```bash
cd backend
node index.js
```
This server communicates between the MongoDB Cluster and the Front-end

Navigate to the **senior design** folder, to start the frontend application:
```bash
cd ../senior design
npm run dev
```
### Access the application
Open your browser and navigate to the appropriate URL (e.g., http://localhost:5173) to access the application.


## Acknowledgments
Thanks to our advisor, [Dr. Filippos Vokolos](https://drexel.edu/cci/about/directory/V/Vokolos-Filippos/), for his guidance and support throughout the project.
