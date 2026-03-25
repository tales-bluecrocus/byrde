/**
 * HeroForm — Lazy-loaded contact form for Hero section.
 */

import { useState, useCallback, memo } from 'react';
import { useContent } from '../context/ContentContext';
import { useSettings } from '../hooks/useSettings';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { useFormTracking } from '../hooks/useAnalytics';
import { trackFormSubmitted, trackFormError, trackPhoneClick, getAttributionForSubmission } from '../lib/analytics';
import { renderColoredText } from '../utils/renderHeadline';
import { getContrastColor } from '../utils/colorUtils';

// ============================================
// ICONS
// ============================================

const SpinnerIcon = memo(() => (
	<svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
		<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
		<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
	</svg>
));
SpinnerIcon.displayName = 'SpinnerIcon';

// ============================================
// FORM HELPERS
// ============================================

interface FormData {
	name: string;
	phone: string;
	email: string;
	message: string;
}

interface FormErrors {
	name?: string;
	phone?: string;
	email?: string;
}

const INITIAL_FORM_DATA: FormData = { name: '', phone: '', email: '', message: '' };

function formatPhone(value: string): string {
	const digits = value.replace(/\D/g, '').slice(0, 10);
	if (digits.length <= 3) return digits;
	if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
	return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function validateForm(formData: FormData): FormErrors {
	const errors: FormErrors = {};
	if (!formData.name.trim()) {
		errors.name = 'Name is required';
	} else if (!formData.name.trim().includes(' ')) {
		errors.name = 'Please enter your full name';
	}
	if (!formData.phone.trim()) {
		errors.phone = 'Phone is required';
	} else if (formData.phone.replace(/\D/g, '').length < 10) {
		errors.phone = 'Please enter a valid phone number';
	}
	if (!formData.email.trim()) {
		errors.email = 'Email is required';
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
		errors.email = 'Please enter a valid email';
	}
	return errors;
}

// ============================================
// PROPS
// ============================================

export interface HeroFormProps {
	themeStyles: {
		formAccentColor: string;
		cardBgColor: string;
		formBorderColor: string;
		formTextPrimary: string;
		formTextSecondary: string;
		isFormLightMode: boolean;
		inputBg: string;
		inputBorder: string;
		inputText: string;
		inputFocusBorder: string;
		labelColor: string;
		buttonBg: string;
	};
}

// ============================================
// COMPONENT
// ============================================

export default function HeroForm({ themeStyles }: HeroFormProps) {
	const { getContent } = useContent();
	const settings = useSettings();
	const { globalConfig } = useGlobalConfig();
	const content = getContent('hero');

	const formTracking = useFormTracking({
		formName: 'hero_contact_form',
		formLocation: 'hero',
	});

	const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
	const [errors, setErrors] = useState<FormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		formTracking.trackStart();
		if (name === 'phone') {
			setFormData(prev => ({ ...prev, [name]: formatPhone(value) }));
		} else {
			setFormData(prev => ({ ...prev, [name]: value }));
		}
		if (errors[name as keyof FormErrors]) {
			setErrors(prev => ({ ...prev, [name]: undefined }));
		}
	}, [errors, formTracking]);

	const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		if (value.trim()) formTracking.trackFieldComplete(name);
	}, [formTracking]);

	const handleSubmit = useCallback(async (e: React.FormEvent) => {
		e.preventDefault();
		const validationErrors = validateForm(formData);
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			Object.keys(validationErrors).forEach((field) => {
				trackFormError('hero_contact_form', 'validation_error', field);
			});
			return;
		}
		setIsSubmitting(true);
		setSubmitError(null);
		try {
			const [response] = await Promise.all([
				fetch(`${settings.apiUrl}/contact`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						...formData,
						service: content.formDefaultService || 'junk-removal',
						_honeypot: (document.getElementById('byrde_hp') as HTMLInputElement)?.value || '',
						attribution: getAttributionForSubmission(),
					}),
				}),
				new Promise((r) => setTimeout(r, 1500)),
			]);
			const result = await response.json();
			if (!response.ok || !result.success) throw new Error(result.message || 'Submission failed');
			trackFormSubmitted('hero_contact_form', 'hero', { service: content.formDefaultService || 'junk-removal' });
			setIsSuccess(true);
			setFormData(INITIAL_FORM_DATA);
			setTimeout(() => setIsSuccess(false), 5000);
		} catch (error) {
			trackFormError('hero_contact_form', 'submission_error');
			setSubmitError('Something went wrong. Please try again or call us directly.');
		} finally {
			setIsSubmitting(false);
		}
	}, [formData, settings.apiUrl, content.formDefaultService]);

	return (
		<div>
			<div className="relative">
				{/* Floating Card Effect */}
				<div className="absolute -inset-4 rounded-3xl blur-2xl opacity-60" style={{ background: `linear-gradient(to right, ${themeStyles.formAccentColor}33, ${themeStyles.formAccentColor}1a, ${themeStyles.formAccentColor}33)` }} />

				<div
					className="relative backdrop-blur-sm rounded-2xl shadow-2xl p-8 border"
					style={{
						backgroundColor: themeStyles.cardBgColor,
						borderColor: themeStyles.formBorderColor,
						'--section-text-primary': themeStyles.formTextPrimary,
						'--section-text-secondary': themeStyles.formTextSecondary,
						boxShadow: themeStyles.isFormLightMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)' : '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
					} as React.CSSProperties}
				>
					{/* Form Header */}
					<div className="text-center mb-8">
						<h2 className="font-[var(--font-display)] text-2xl font-bold section-text-primary mb-2">
							{renderColoredText(content.formTitle || 'Fill Out This Form for Your Free Estimate')}
						</h2>
						<p className="section-text-secondary text-sm mb-4">
							{renderColoredText(content.formSubtitle || "We'll get back to you within 30 minutes")}
						</p>
						{settings.phone_raw && (
							<div className="flex items-center justify-center gap-2 text-sm">
								<span style={{ color: themeStyles.formTextSecondary }}>Or call now:</span>
								<a
									href={`tel:${settings.phone_raw}`}
									onClick={() => trackPhoneClick('hero_form_header')}
									className="text-lg font-semibold hover:underline transition-colors"
									style={{ color: themeStyles.formAccentColor }}
								>
									{settings.phone}
								</a>
							</div>
						)}
					</div>

					{isSuccess ? (
						<div className="text-center py-8">
							<div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${themeStyles.formAccentColor}33` }}>
								<svg className="w-8 h-8" fill="none" stroke={themeStyles.formAccentColor} viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold section-text-primary mb-2">Request Sent!</h3>
							<p className="section-text-secondary">We'll contact you shortly.</p>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-5">
							{/* Honeypot */}
							<label htmlFor="byrde_hp" className="sr-only">Leave this empty</label>
							<input type="text" id="byrde_hp" name="_honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }} />

							{/* Name */}
							<div>
								<label htmlFor="name" className="block text-sm font-medium mb-1.5" style={{ color: themeStyles.labelColor }}>Full Name</label>
								<input type="text" id="name" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur}
									className="w-full px-4 py-3 rounded-xl border transition-all duration-100 outline-none focus:ring-2 focus:ring-offset-1"
									style={{ backgroundColor: errors.name ? 'rgba(239, 68, 68, 0.1)' : themeStyles.inputBg, borderColor: errors.name ? '#ef4444' : themeStyles.inputBorder, color: themeStyles.inputText, '--tw-ring-color': `${themeStyles.inputFocusBorder}33` } as React.CSSProperties}
									placeholder="Full Name" />
								{errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
							</div>

							{/* Phone & Email */}
							<div className="grid sm:grid-cols-2 gap-4">
								<div>
									<label htmlFor="phone" className="block text-sm font-medium mb-1.5" style={{ color: themeStyles.labelColor }}>Phone</label>
									<input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur}
										className="w-full px-4 py-3 rounded-xl border transition-all duration-100 outline-none focus:ring-2 focus:ring-offset-1"
										style={{ backgroundColor: errors.phone ? 'rgba(239, 68, 68, 0.1)' : themeStyles.inputBg, borderColor: errors.phone ? '#ef4444' : themeStyles.inputBorder, color: themeStyles.inputText, '--tw-ring-color': `${themeStyles.inputFocusBorder}33` } as React.CSSProperties}
										placeholder="Phone" />
									{errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
								</div>
								<div>
									<label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: themeStyles.labelColor }}>Email</label>
									<input type="email" id="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur}
										className="w-full px-4 py-3 rounded-xl border transition-all duration-100 outline-none focus:ring-2 focus:ring-offset-1"
										style={{ backgroundColor: errors.email ? 'rgba(239, 68, 68, 0.1)' : themeStyles.inputBg, borderColor: errors.email ? '#ef4444' : themeStyles.inputBorder, color: themeStyles.inputText, '--tw-ring-color': `${themeStyles.inputFocusBorder}33` } as React.CSSProperties}
										placeholder="Email" />
									{errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
								</div>
							</div>

							{/* Message */}
							<div>
								<label htmlFor="message" className="block text-sm font-medium mb-1.5" style={{ color: themeStyles.labelColor }}>
									Message <span style={{ color: themeStyles.formTextSecondary, opacity: 0.7 }}>(optional)</span>
								</label>
								<textarea id="message" name="message" value={formData.message} onChange={handleChange} onBlur={handleBlur} rows={3}
									className="w-full px-4 py-3 rounded-xl border transition-all duration-100 outline-none resize-none focus:ring-2 focus:ring-offset-1"
									style={{ backgroundColor: themeStyles.inputBg, borderColor: themeStyles.inputBorder, color: themeStyles.inputText, '--tw-ring-color': `${themeStyles.inputFocusBorder}33` } as React.CSSProperties}
									placeholder="Message" />
							</div>

							{/* Submit */}
							<button type="submit" disabled={isSubmitting}
								className="btn-themed w-full py-4 rounded-xl font-semibold text-lg shadow-lg shadow-black/25"
								style={globalConfig.form.buttonBg ? { backgroundColor: themeStyles.buttonBg, color: getContrastColor(themeStyles.buttonBg) } : undefined}
							>
								{isSubmitting ? (
									<span className="flex items-center justify-center gap-2"><SpinnerIcon />Sending...</span>
								) : (
									content.formSubmitText || 'Get My Free Quote'
								)}
							</button>

							{/* Submit Error */}
							{submitError && (
								<p className="text-center text-sm text-red-500 font-medium">{submitError}</p>
							)}

							{/* Privacy */}
							<p className="text-center text-xs opacity-60" style={{ color: themeStyles.formTextSecondary }}>
								By submitting, you agree to our{' '}
								<a href={settings.privacy_policy_url} className="hover:underline" style={{ color: themeStyles.formAccentColor }}>Privacy Policy</a>
							</p>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}
