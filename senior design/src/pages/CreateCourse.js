// CreateCourse.js
import React, { useState } from 'react';
import './createCourses.css';

function CreateCourse() {
    const [courseName, setCourseName] = useState('');
    const [courseDescription, setCourseDescription] = useState('');
    const [instructorName, setInstructorName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        // Example: Saving course data to localStorage
        const newCourse = {
            name: courseName,
            description: courseDescription,
            instructor: instructorName
        };
        
        // In a real-world app, you would likely send the data to the backend instead of just using localStorage
        console.log('Course Created:', newCourse);

        // Reset form fields
        setCourseName('');
        setCourseDescription('');
        setInstructorName('');
    };

    return (
        <div className="form-container">
            <h1>Create a New Course</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Course Name:
                    <input
                        type="text"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Course Description:
                    <input
                        type="text"
                        value={courseDescription}
                        onChange={(e) => setCourseDescription(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Instructor Name:
                    <input
                        type="text"
                        value={instructorName}
                        onChange={(e) => setInstructorName(e.target.value)}
                        required
                    />
                </label>
                <button type="submit">Create Course</button>
            </form>
        </div>
    );
}

export default CreateCourse;
