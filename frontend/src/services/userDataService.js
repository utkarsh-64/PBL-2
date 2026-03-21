import { API_BASE_URL } from '../utils/constants';


class UserDataService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /**
     * Get authentication headers
     */
    getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    /**
     * Get all user data formatted for LLM consumption
     */
    async getAllUserData() {
        try {
            const response = await fetch(`${this.baseURL}/auth/user/all-data/`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    }

    /**
     * Get LLM response using user's stored data as context
     */
    async getLLMResponseWithUserData(message) {
        try {
            const response = await fetch(`${this.baseURL}/auth/llm/chat-with-data/`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting LLM response:', error);
            throw error;
        }
    }

    /**
     * Get user data summary and completion status
     */
    async getUserDataSummary() {
        try {
            const allData = await this.getAllUserData();
            
            const summary = {
                has_personal_info: !!allData.personal_info,
                has_income_info: !!allData.income_info,
                has_retirement_info: !!allData.retirement_info,
                has_health_info: !!allData.health_info,
                completion_percentage: 0,
                missing_sections: [],
                recommendations: []
            };

            // Calculate completion percentage
            const totalSections = 4;
            const completedSections = [
                summary.has_personal_info,
                summary.has_income_info,
                summary.has_retirement_info,
                summary.has_health_info
            ].filter(Boolean).length;

            summary.completion_percentage = (completedSections / totalSections) * 100;

            // Identify missing sections
            if (!summary.has_personal_info) {
                summary.missing_sections.push('personal_info');
                summary.recommendations.push('Please complete your basic personal information');
            }
            if (!summary.has_income_info) {
                summary.missing_sections.push('income_info');
                summary.recommendations.push('Please provide your income and employment details');
            }
            if (!summary.has_retirement_info) {
                summary.missing_sections.push('retirement_info');
                summary.recommendations.push('Please set your retirement goals and preferences');
            }
            if (!summary.has_health_info) {
                summary.missing_sections.push('health_info');
                summary.recommendations.push('Please complete the health assessment for better predictions');
            }

            return summary;
        } catch (error) {
            console.error('Error getting user data summary:', error);
            throw error;
        }
    }

    /**
     * Format user data for display
     */
    formatUserDataForDisplay(userData) {
        const formatted = {};

        if (userData.personal_info) {
            formatted.personal = {
                name: userData.personal_info.name || 'Not provided',
                dateOfBirth: userData.personal_info.date_of_birth ? 
                    new Date(userData.personal_info.date_of_birth).toLocaleDateString() : 'Not provided',
                gender: userData.personal_info.gender || 'Not provided',
                location: userData.personal_info.location || 'Not provided',
                maritalStatus: userData.personal_info.marital_status || 'Not provided',
                numberOfDependants: userData.personal_info.number_of_dependants || 0
            };
        }

        if (userData.income_info) {
            formatted.income = {
                currentSalary: userData.income_info.current_salary ? 
                    `$${userData.income_info.current_salary.toLocaleString()}` : 'Not provided',
                yearsOfService: userData.income_info.years_of_service || 'Not provided',
                employerType: userData.income_info.employer_type || 'Not provided',
                pensionScheme: userData.income_info.pension_scheme || 'Not provided',
                pensionBalance: userData.income_info.pension_balance ? 
                    `$${userData.income_info.pension_balance.toLocaleString()}` : 'Not provided',
                employerContribution: userData.income_info.employer_contribution ? 
                    `$${userData.income_info.employer_contribution.toLocaleString()}` : 'Not provided',
                yourContribution: userData.income_info.your_contribution ? 
                    `$${userData.income_info.your_contribution.toLocaleString()}` : 'Not provided'
            };
        }

        if (userData.retirement_info) {
            formatted.retirement = {
                plannedRetirementAge: userData.retirement_info.planned_retirement_age || 'Not provided',
                retirementLifestyle: userData.retirement_info.retirement_lifestyle || 'Not provided',
                monthlyRetirementExpense: userData.retirement_info.monthly_retirement_expense ? 
                    `$${userData.retirement_info.monthly_retirement_expense.toLocaleString()}` : 'Not provided',
                legacyGoal: userData.retirement_info.legacy_goal || 'Not provided'
            };
        }

        if (userData.health_info) {
            formatted.health = {
                height: userData.health_info.height ? `${userData.health_info.height} cm` : 'Not provided',
                weight: userData.health_info.weight ? `${userData.health_info.weight} kg` : 'Not provided',
                bmi: userData.health_info.bmi || 'Not provided',
                physicalActivity: userData.health_info.physical_activity || 'Not provided',
                smokingStatus: userData.health_info.smoking_status || 'Not provided',
                alcoholConsumption: userData.health_info.alcohol_consumption || 'Not provided',
                diet: userData.health_info.diet || 'Not provided',
                bloodPressure: userData.health_info.blood_pressure || 'Not provided',
                cholesterol: userData.health_info.cholesterol || 'Not provided',
                predictedLifeExpectancy: userData.health_info.predicted_life_expectancy ? 
                    `${userData.health_info.predicted_life_expectancy} years` : 'Not provided',
                isSkipped: userData.health_info.is_skipped || false
            };
        }

        return formatted;
    }

    /**
     * Send a message to the LLM with user context and get response
     */
    async chatWithLLM(message) {
        try {
            const response = await this.getLLMResponseWithUserData(message);
            return {
                success: true,
                userMessage: message,
                llmResponse: response.llm_response,
                userContextUsed: response.user_context_used,
                hasUserData: response.has_user_data
            };
        } catch (error) {
            console.error('Error chatting with LLM:', error);
            return {
                success: false,
                error: error.message,
                userMessage: message,
                llmResponse: 'Sorry, I encountered an error while processing your request.'
            };
        }
    }
}

export const userDataService = new UserDataService();
