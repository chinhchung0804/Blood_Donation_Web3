import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Droplets, Heart } from 'lucide-react';
import '../styles/animation.css';

interface FormData {
  [key: string]: string | boolean | null;
}

interface DonatePageProps {
  isSidebarExpanded: boolean;
  theme: 'light' | 'dark'; // Thêm theme vào props
}

function DonatePage({ isSidebarExpanded, theme }: DonatePageProps) {
  const [formData, setFormData] = useState<FormData>({});
  const [showResults, setShowResults] = useState(false);
  const [bloodDrops, setBloodDrops] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);
  const [showRipple, setShowRipple] = useState<{ x: number; y: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Generate blood drops on component mount
  useEffect(() => {
    const generateBloodDrops = () => {
      const newDrops = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 5 + Math.random() * 5,
      }));
      setBloodDrops(newDrops);
    };

    generateBloodDrops();
    window.addEventListener("load", generateBloodDrops);
    return () => window.removeEventListener("load", generateBloodDrops);
  }, []);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null); // Reset error when user changes input
  };

  const validateForm = () => {
    const requiredFields = [
      'age',
      'weight',
      'recentIllness',
      'chronicConditions',
      'infectiousDisease',
      'bleedingDisorders',
      'recentAlcohol',
      'recentDrugs',
      'recentTattoo',
      'recentTravel',
      'highRiskActivities',
      'previousDonation',
      'recentDonation'
    ];

    for (const field of requiredFields) {
      if (formData[field] === undefined || formData[field] === '') {
        return `Vui lòng trả lời tất cả các câu hỏi bắt buộc.`;
      }
    }

    if (formData.age && formData.exactAge) {
      const age = parseInt(formData.exactAge as string);
      if (age < 18 || age > 65) {
        return 'Tuổi của bạn phải từ 18 đến 65 để đủ điều kiện hiến máu.';
      }
    }

    if (formData.previousDonation === 'yes' && formData.lastDonationDate) {
      const lastDonation = new Date(formData.lastDonationDate as string);
      const today = new Date();
      const weeksDifference = (today.getTime() - lastDonation.getTime()) / (1000 * 3600 * 24 * 7);
      if (weeksDifference < 8) {
        return 'Bạn phải chờ ít nhất 8 tuần kể từ lần hiến máu cuối cùng.';
      }
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const button = e.currentTarget.querySelector('button[type="submit"]');
    if (button) {
      const rect = button.getBoundingClientRect();
      const x = rect.width / 2; // Center of the button
      const y = rect.height / 2; // Center of the button
      setShowRipple({ x, y });
    }
    setShowResults(true);
  };

  const handleNavigate = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.width / 2; // Center of the button
    const y = rect.height / 2; // Center of the button
    setShowRipple({ x, y });
    setTimeout(() => navigate('/schedule'), 300); // Navigate after ripple effect
  };

  const isEligible = () => {
    const disqualifyingConditions = [
      !formData.age,
      !formData.weight,
      formData.recentIllness,
      formData.chronicConditions,
      formData.infectiousDisease,
      formData.bleedingDisorders,
      formData.recentAlcohol,
      formData.recentDrugs,
      formData.recentTattoo,
      formData.highRiskActivities,
      formData.recentTravel,
      formData.recentDonation
    ];

    if (formData.chronicConditions && !formData.conditionManaged) {
      return false;
    }

    if (formData.previousDonation === 'yes' && formData.lastDonationDate) {
      const lastDonation = new Date(formData.lastDonationDate as string);
      const today = new Date();
      const weeksDifference = (today.getTime() - lastDonation.getTime()) / (1000 * 3600 * 24 * 7);
      if (weeksDifference < 8) {
        return false;
      }
    }

    return !disqualifyingConditions.some(condition => condition);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'
    }`}>
      {/* Animated Blood Drops Background */}
      <div className="absolute inset-0 pointer-events-none">
        {bloodDrops.map((drop) => (
          <div
            key={drop.id}
            className={`absolute w-4 h-6 bg-gradient-to-b from-red-600 to-red-800 rounded-b-full rounded-t-[40%] opacity-70 animate-blood-drop`}
            style={{
              left: `${drop.left}%`,
              animationDelay: `${drop.delay}s`,
              animationDuration: `${drop.duration}s`,
              transform: "translateZ(0)",
            }}
          />
        ))}
      </div>

      {/* Main Content with Dynamic Padding */}
      <div
        className={`max-w-4xl mx-auto relative z-10 py-8 px-4 transition-all duration-300 ${
          isSidebarExpanded ? 'md:pl-64' : 'md:pl-16'
        } pt-16`}
      >
        <div className="text-center mb-12 transform hover:scale-105 transition-transform duration-300">
          <div className="flex justify-center mb-4">
            <Droplets className={`w-16 h-16 animate-heartbeat ${
              theme === 'dark' ? 'text-red-500' : 'text-red-600'
            }`} />
          </div>
          <h1 className={`text-4xl font-bold mb-2 animate-heartbeat-text ${
            theme === 'dark' ? 'text-red-500' : 'text-red-600'
          }`}>
            Kiểm Tra Điều Kiện Hiến Máu
          </h1>
          <p className={`${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Hãy giúp cứu sống nhiều người bằng cách kiểm tra xem bạn có đủ điều kiện hiến máu không
          </p>
        </div>

        {error && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            theme === 'dark' ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-700'
          }`}>
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Thông Tin Cơ Bản */}
          <div className="question-group">
            <h2 className={`section-title animate-heartbeat-text ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>
              <Heart className={`inline-block mr-2 ${
                theme === 'dark' ? 'text-red-500' : 'text-red-600'
              }`} />
              Thông Tin Cơ Bản
            </h2>

            <div className="question-box">
              <label>
                <span className={`question-text ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>Bạn có trong độ tuổi từ 18 đến 65 không?</span>
                <select
                  onChange={(e) => handleInputChange('age', e.target.value === 'yes')}
                  className={`form-select ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                >
                  <option value="">Chọn...</option>
                  <option value="yes">Có</option>
                  <option value="no">Không</option>
                </select>
              </label>
              {formData.age && (
                <input
                  type="number"
                  placeholder="Nhập tuổi chính xác của bạn"
                  className={`form-input mt-2 ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                  onChange={(e) => handleInputChange('exactAge', e.target.value)}
                />
              )}
            </div>

            <div className="question-box">
              <label>
                <span className={`question-text ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>Bạn có cân nặng ít nhất 50 kg không?</span>
                <select
                  onChange={(e) => handleInputChange('weight', e.target.value === 'yes')}
                  className={`form-select ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                >
                  <option value="">Chọn...</option>
                  <option value="yes">Có</option>
                  <option value="no">Không</option>
                </select>
              </label>
            </div>
          </div>

          {/* Tình Trạng Sức Khỏe */}
          <div className="question-group">
            <h2 className={`section-title animate-heartbeat-text ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>Tình Trạng Sức Khỏe</h2>

            <div className="question-box">
              <label>
                <span className={`question-text ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>Bạn có bị sốt, cảm lạnh, cúm hoặc bệnh khác trong 7 ngày qua không?</span>
                <select
                  onChange={(e) => handleInputChange('recentIllness', e.target.value === 'yes')}
                  className={`form-select ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                >
                  <option value="">Chọn...</option>
                  <option value="yes">Có</option>
                  <option value="no">Không</option>
                </select>
              </label>
            </div>

            <div className="question-box">
              <label>
                <span className={`question-text ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>Bạn có mắc bệnh mãn tính nào không?</span>
                <select
                  onChange={(e) => handleInputChange('chronicConditions', e.target.value === 'yes')}
                  className={`form-select ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                >
                  <option value="">Chọn...</option>
                  <option value="yes">Có</option>
                  <option value="no">Không</option>
                </select>
              </label>
              {formData.chronicConditions === 'yes' && (
                <label className="mt-2 block">
                  <span className={`question-text ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                  }`}>Bệnh của bạn có được kiểm soát tốt bằng điều trị không?</span>
                  <select
                    onChange={(e) => handleInputChange('conditionManaged', e.target.value === 'yes')}
                    className={`form-select ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                    }`}
                  >
                    <option value="">Chọn...</option>
                    <option value="yes">Có</option>
                    <option value="no">Không</option>
                  </select>
                </label>
              )}
            </div>

            <div className="question-box">
              <label>
                <span className={`question-text ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>Bạn hiện có đang dùng thuốc kê đơn nào không?</span>
                <select
                  onChange={(e) => handleInputChange('medications', e.target.value === 'yes')}
                  className={`form-select ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                >
                  <option value="">Chọn...</option>
                  <option value="yes">Có</option>
                  <option value="no">Không</option>
                </select>
              </label>
              {formData.medications === 'yes' && (
                <textarea
                  placeholder="Vui lòng liệt kê các loại thuốc bạn đang dùng (không bắt buộc)"
                  className={`form-input mt-2 ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                  onChange={(e) => handleInputChange('medicationList', e.target.value)}
                />
              )}
            </div>
          </div>

          {/* Lịch Sử Y Tế */}
          <div className="question-group">
            <h2 className={`section-title animate-heartbeat-text ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>Lịch Sử Y Tế</h2>

            <div className="question-box">
              <label>
                <span className={`question-text ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>Bạn đã từng xét nghiệm dương tính với HIV, Viêm gan B hoặc Viêm gan C chưa?</span>
                <select
                  onChange={(e) => handleInputChange('infectiousDisease', e.target.value === 'yes')}
                  className={`form-select ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                >
                  <option value="">Chọn...</option>
                  <option value="yes">Có</option>
                  <option value="no">Không</option>
                </select>
              </label>
            </div>

            <div className="question-box">
              <label>
                <span className={`question-text ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>Bạn có tiêm vắc-xin trong 4 tuần qua không?</span>
                <select
                  onChange={(e) => handleInputChange('recentVaccination', e.target.value === 'yes')}
                  className={`form-select ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                >
                  <option value="">Chọn...</option>
                  <option value="yes">Có</option>
                  <option value="no">Không</option>
                </select>
              </label>
            </div>

            <div className="question-box">
              <label>
                <span className={`question-text ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>Bạn có mắc rối loạn đông máu không?</span>
                <select
                  onChange={(e) => handleInputChange('bleedingDisorders', e.target.value === 'yes')}
                  className={`form-select ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                >
                  <option value="">Chọn...</option>
                  <option value="yes">Có</option>
                  <option value="no">Không</option>
                </select>
              </label>
            </div>
          </div>

          {/* Yếu Tố Lối Sống */}
          <div className="question-group">
            <h2 className={`section-title animate-heartbeat-text ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>Yếu Tố Lối Sống</h2>

            <div className="question-box">
              <label>
                <span className={`question-text ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>Bạn có uống rượu bia trong 24-48 giờ qua không?</span>
                <select
                  onChange={(e) => handleInputChange('recentAlcohol', e.target.value === 'yes')}
                  className={`form-select ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                >
                  <option value="">Chọn...</option>
                  <option value="yes">Có</option>
                  <option value="no">Không</option>
                </select>
              </label>
            </div>

            <div className="question-box">
              <label>
                <span className={`question-text ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>Bạn có sử dụng ma túy trong 6 tháng qua không?</span>
                <select
                  onChange={(e) => handleInputChange('recentDrugs', e.target.value === 'yes')}
                  className={`form-select ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                >
                  <option value="">Chọn...</option>
                  <option value="yes">Có</option>
                  <option value="no">Không</option>
                </select>
              </label>
            </div>

            <div className="question-box">
              <label>
                <span className={`question-text ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>Bạn có xăm hình hoặc xỏ khuyên trong 6 tháng qua không?</span>
                <select
                  onChange={(e) => handleInputChange('recentTattoo', e.target.value === 'yes')}
                  className={`form-select ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                >
                  <option value="">Chọn...</option>
                  <option value="yes">Có</option>
                  <option value="no">Không</option>
                </select>
              </label>
            </div>
          </div>

          {/* Đánh Giá Du Lịch và Rủi Ro */}
          <div className="question-group">
            <h2 className={`section-title animate-heartbeat-text ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>Đánh Giá Du Lịch và Rủi Ro</h2>

            <div className="question-box">
              <label>
                <span className={`question-text ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>Bạn có đi du lịch đến khu vực có nguy cơ cao trong 12 tháng qua không?</span>
                <select
                  onChange={(e) => handleInputChange('recentTravel', e.target.value === 'yes')}
                  className={`form-select ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                >
                  <option value="">Chọn...</option>
                  <option value="yes">Có</option>
                  <option value="no">Không</option>
                </select>
              </label>
            </div>

            <div className="question-box">
              <label>
                <span className={`question-text ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>Bạn có ăn uống trong 4 giờ qua không?</span>
                <select
                  onChange={(e) => handleInputChange('highRiskActivities', e.target.value === 'no')}
                  className={`form-select ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                >
                  <option value="">Chọn...</option>
                  <option value="yes">Có</option>
                  <option value="no">Không</option>
                </select>
              </label>
            </div>
          </div>

          {/* Lần Hiến Máu Trước */}
          <div className="question-group">
            <h2 className={`section-title animate-heartbeat-text ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>Lần Hiến Máu Trước</h2>

            <div className="question-box">
              <label>
                <span className={`question-text ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>Bạn đã từng hiến máu trước đây chưa?</span>
                <select
                  onChange={(e) => handleInputChange('previousDonation', e.target.value === 'yes')}
                  className={`form-select ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                >
                  <option value="">Chọn...</option>
                  <option value="yes">Có</option>
                  <option value="no">Không</option>
                </select>
              </label>
              {formData.previousDonation === 'yes' && (
                <input
                  type="date"
                  className={`form-input mt-2 ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                  onChange={(e) => handleInputChange('lastDonationDate', e.target.value)}
                />
              )}
            </div>

            <div className="question-box">
              <label>
                <span className={`question-text ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>Bạn có hiến máu trong 8-12 tuần qua không?</span>
                <select
                  onChange={(e) => handleInputChange('recentDonation', e.target.value === 'yes')}
                  className={`form-select ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                >
                  <option value="">Chọn...</option>
                  <option value="yes">Có</option>
                  <option value="no">Không</option>
                </select>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-12 relative">
            <button
              type="submit"
              className={`submit-button ${
                theme === 'dark' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              Kiểm Tra Điều Kiện
            </button>
            {showRipple && (
              <span
                className="absolute rounded-full bg-red-500 opacity-50 animate-ripple"
                style={{
                  left: showRipple.x,
                  top: showRipple.y,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            )}
          </div>
        </form>

        {/* Results Section */}
        {showResults && (
          <div className={`results-card ${isEligible() ? 'eligible' : 'ineligible'} ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <AlertCircle className={isEligible() ? 'text-green-600' : 'text-red-600'} />
              <h3 className={`text-xl font-semibold animate-heartbeat-text ${
                isEligible() ? 'text-green-600' : 'text-red-600'
              }`}>
                {isEligible() ? 'Bạn đủ điều kiện để hiến máu!' : 'Bạn hiện không đủ điều kiện để hiến máu'}
              </h3>
            </div>
            <p className={`mt-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {isEligible()
                ? 'Vui lòng đến trung tâm hiến máu gần nhất.'
                : 'Vui lòng xem lại các yêu cầu và thử lại khi bạn đáp ứng đủ các tiêu chí.'}
            </p>
            {isEligible() && (
              <div className="relative">
                <button
                  className={`px-8 py-3 rounded-full font-semibold transition-colors flex items-center gap-2 justify-center ${
                    theme === 'dark'
                      ? 'bg-gray-900 text-red-500 hover:bg-gray-700'
                      : 'bg-white text-red-600 hover:bg-gray-100'
                  }`}
                  onClick={handleNavigate}
                >
                  Đặt Lịch Hẹn
                </button>
                {showRipple && (
                  <span
                    className="absolute rounded-full bg-red-500 opacity-50 animate-ripple"
                    style={{
                      left: showRipple.x,
                      top: showRipple.y,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DonatePage;