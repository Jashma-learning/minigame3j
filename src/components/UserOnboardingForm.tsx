import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface UserData {
  name: string;
  age: number;
  educationLevel: string;
  previousExperience: string;
  cognitiveConditions: string[];
  preferredDifficulty: string;
  playTime: string;
}

interface UserOnboardingFormProps {
  onSubmit: (data: UserData) => void;
}

const UserOnboardingForm: React.FC<UserOnboardingFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<UserData>({
    name: '',
    age: 0,
    educationLevel: '',
    previousExperience: 'none',
    cognitiveConditions: [],
    preferredDifficulty: 'medium',
    playTime: '15-30min'
  });

  const [currentStep, setCurrentStep] = useState(0);

  const cognitiveConditionOptions = [
    'None',
    'ADHD',
    'Dyslexia',
    'Memory Issues',
    'Anxiety',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      cognitiveConditions: prev.cognitiveConditions.includes(condition)
        ? prev.cognitiveConditions.filter(c => c !== condition)
        : [...prev.cognitiveConditions, condition]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const formSteps = [
    // Step 1: Basic Information
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
        <input
          type="number"
          name="age"
          value={formData.age || ''}
          onChange={handleInputChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your age"
          min="0"
          max="120"
        />
      </div>
    </motion.div>,

    // Step 2: Educational Background
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Educational Background</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
        <select
          name="educationLevel"
          value={formData.educationLevel}
          onChange={handleInputChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select education level</option>
          <option value="primary">Primary School</option>
          <option value="secondary">Secondary School</option>
          <option value="highschool">High School</option>
          <option value="undergraduate">Undergraduate</option>
          <option value="postgraduate">Postgraduate</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Previous Experience with Cognitive Games
        </label>
        <select
          name="previousExperience"
          value={formData.previousExperience}
          onChange={handleInputChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="none">No Experience</option>
          <option value="some">Some Experience</option>
          <option value="moderate">Moderate Experience</option>
          <option value="extensive">Extensive Experience</option>
        </select>
      </div>
    </motion.div>,

    // Step 3: Cognitive Profile
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Cognitive Profile</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cognitive Conditions (if any)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {cognitiveConditionOptions.map(condition => (
            <label key={condition} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.cognitiveConditions.includes(condition)}
                onChange={() => handleCheckboxChange(condition)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{condition}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Difficulty Level
        </label>
        <select
          name="preferredDifficulty"
          value={formData.preferredDifficulty}
          onChange={handleInputChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="easy">Easy - I prefer a gentle challenge</option>
          <option value="medium">Medium - I can handle moderate difficulty</option>
          <option value="hard">Hard - I want a significant challenge</option>
        </select>
      </div>
    </motion.div>
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        {formSteps[currentStep]}
        
        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${currentStep === 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-600 hover:bg-blue-50'}`}
            disabled={currentStep === 0}
          >
            Previous
          </button>
          
          {currentStep < formSteps.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.min(formSteps.length - 1, prev + 1))}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Games
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserOnboardingForm; 