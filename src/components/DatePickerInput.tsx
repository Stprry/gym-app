// src/components/DatePickerInput.tsx
import React, { useState, useRef } from "react";
import {
	Platform,
	TouchableOpacity,
	StyleSheet,
	View,
	Text,
	Modal,
	SafeAreaView
} from "react-native";
import DateTimePicker, {
	DateTimePickerEvent
} from "@react-native-community/datetimepicker";
import { FormInput } from "./FormInput";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react-native";

interface DatePickerInputProps {
	label: string;
	value: Date;
	onChange: (date: Date) => void;
	required?: boolean;
	editable?: boolean;
	error?: string;
	minDate?: Date;
	maxDate?: Date;
	onPress?: () => void;
}

const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
];

const YEARS = Array.from(
	{ length: 124 },
	(_, i) => new Date().getFullYear() - i
);

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
	label,
	value,
	onChange,
	required = false,
	editable = true,
	error,
	minDate = new Date(1900, 0, 1),
	maxDate = new Date(),
	onPress
}) => {
	const [showPicker, setShowPicker] = useState(false);
	const [selectedDate, setSelectedDate] = useState(value);
	const [currentMonth, setCurrentMonth] = useState(value.getMonth());
	const [currentYear, setCurrentYear] = useState(value.getFullYear());
	const [tempDate, setTempDate] = useState(value); // For iOS temp state

	const getDaysInMonth = (month: number, year: number) => {
		return new Date(year, month + 1, 0).getDate();
	};

	const getFirstDayOfMonth = (month: number, year: number) => {
		return new Date(year, month, 1).getDay();
	};

	const handleDateClick = (day: number) => {
		const newDate = new Date(currentYear, currentMonth, day);
		if (newDate >= minDate && newDate <= maxDate) {
			setSelectedDate(newDate);
			onChange(newDate);
			setShowPicker(false);
		}
	};

	const handlePress = () => {
		if (editable) {
			if (onPress) {
				onPress();
			}
			setTempDate(selectedDate);
			setShowPicker(true);
		}
	};

	// iOS specific handlers
	const handleIOSConfirm = () => {
		setSelectedDate(tempDate);
		onChange(tempDate);
		setShowPicker(false);
	};

	const handleIOSCancel = () => {
		setTempDate(selectedDate);
		setShowPicker(false);
	};

	// Handle date change based on platform
	const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
		if (Platform.OS === "android") {
			setShowPicker(false);
			if (event.type === "set" && date) {
				setSelectedDate(date);
				onChange(date);
			}
		} else if (Platform.OS === "ios") {
			if (date) {
				setTempDate(date);
			}
		}
	};

	const renderCalendar = () => {
		const daysInMonth = getDaysInMonth(currentMonth, currentYear);
		const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
		const weeks = [];
		let days = [];

		// Add empty cells for days before the first day of the month
		for (let i = 0; i < firstDay; i++) {
			days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
		}

		// Add the days of the month
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(currentYear, currentMonth, day);
			const isSelected = date.toDateString() === selectedDate.toDateString();
			const isDisabled = date < minDate || date > maxDate;

			days.push(
				<TouchableOpacity
					key={day}
					style={[
						styles.dayCell,
						isSelected && styles.selectedDay,
						isDisabled && styles.disabledDay
					]}
					onPress={() => !isDisabled && handleDateClick(day)}
					disabled={isDisabled}
				>
					<Text
						style={[
							styles.dayText,
							isSelected && styles.selectedDayText,
							isDisabled && styles.disabledDayText
						]}
					>
						{day}
					</Text>
				</TouchableOpacity>
			);

			if ((firstDay + day) % 7 === 0 || day === daysInMonth) {
				weeks.push(
					<View key={`week-${weeks.length}`} style={styles.weekRow}>
						{days}
					</View>
				);
				days = [];
			}
		}

		return weeks;
	};

	const WebCalendar = () => (
		<View style={styles.calendarContent}>
			<View style={styles.calendarHeader}>
				<View style={styles.monthYearSelectors}>
					<TouchableOpacity
						onPress={() => {
							const newDate = new Date(currentYear, currentMonth - 1);
							setCurrentMonth(newDate.getMonth());
							setCurrentYear(newDate.getFullYear());
						}}
					>
						<ChevronLeft size={20} color="#666" />
					</TouchableOpacity>

					<View style={styles.monthYearPicker}>
						<select
							value={currentMonth}
							onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
							style={styles.select as any}
						>
							{MONTHS.map((month, index) => (
								<option key={month} value={index}>
									{month}
								</option>
							))}
						</select>
						<select
							value={currentYear}
							onChange={(e) => setCurrentYear(parseInt(e.target.value))}
							style={styles.select as any}
						>
							{YEARS.map((year) => (
								<option key={year} value={year}>
									{year}
								</option>
							))}
						</select>
					</View>

					<TouchableOpacity
						onPress={() => {
							const newDate = new Date(currentYear, currentMonth + 1);
							setCurrentMonth(newDate.getMonth());
							setCurrentYear(newDate.getFullYear());
						}}
					>
						<ChevronRight size={20} color="#666" />
					</TouchableOpacity>
				</View>
			</View>

			<View style={styles.weekDayHeader}>
				{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
					<Text key={day} style={styles.weekDayText}>
						{day}
					</Text>
				))}
			</View>

			<View style={styles.calendarBody}>{renderCalendar()}</View>
		</View>
	);

	if (Platform.OS === "web") {
		return (
			<View style={styles.webContainer}>
				<TouchableOpacity
					onPress={() => editable && setShowPicker(!showPicker)}
					style={styles.inputContainer}
				>
					<FormInput
						label={label}
						required={required}
						value={selectedDate.toLocaleDateString()}
						editable={false}
						error={error}
						leftIcon={<Calendar size={20} color="#666" />}
					/>
				</TouchableOpacity>

				{showPicker && (
					<Modal
						transparent
						visible={showPicker}
						onRequestClose={() => setShowPicker(false)}
					>
						<TouchableOpacity
							style={styles.modalOverlay}
							onPress={() => setShowPicker(false)}
						>
							<View
								style={styles.modalContent}
								onStartShouldSetResponder={() => true}
								onTouchEnd={(e) => e.stopPropagation()}
							>
								<WebCalendar />
							</View>
						</TouchableOpacity>
					</Modal>
				)}
			</View>
		);
	}

	// Native platform code
	return (
		<View style={styles.container}>
			<TouchableOpacity
				onPress={handlePress}
				disabled={!editable}
				style={styles.touchableContainer}
			>
				<FormInput
					label={label}
					value={selectedDate.toLocaleDateString()}
					editable={false}
					required={required}
					error={error}
					placeholder="Select date"
					leftIcon={<Calendar size={20} color={editable ? "#666" : "#999"} />}
					containerStyle={{
						...(editable ? {} : styles.disabledInput),
						...styles.inputContainer,
						width: "100%"
					}}
				/>
			</TouchableOpacity>

			{showPicker &&
				editable &&
				(Platform.OS === "ios" ? (
					<Modal
						transparent
						visible={showPicker}
						animationType="slide"
						presentationStyle="overFullScreen"
					>
						<SafeAreaView style={styles.iosModalOverlay}>
							<View style={styles.iosModalContent}>
								<View style={styles.iosHeader}>
									<TouchableOpacity
										onPress={handleIOSCancel}
										style={styles.iosButton}
									>
										<Text style={styles.iosButtonText}>Cancel</Text>
									</TouchableOpacity>
									<TouchableOpacity
										onPress={handleIOSConfirm}
										style={styles.iosButton}
									>
										<Text style={[styles.iosButtonText, styles.iosDoneButton]}>
											Done
										</Text>
									</TouchableOpacity>
								</View>
								{/* Wrap DateTimePicker in a View with white background */}
								<View style={styles.datePickerContainer}>
									<DateTimePicker
										value={tempDate}
										mode="date"
										display="spinner"
										onChange={handleDateChange}
										maximumDate={maxDate}
										minimumDate={minDate}
										textColor="black" // Add this
										themeVariant="light" // Add this
										style={styles.datePicker} // Add this
									/>
								</View>
							</View>
						</SafeAreaView>
					</Modal>
				) : (
					<DateTimePicker
						value={selectedDate}
						mode="date"
						display="default"
						onChange={handleDateChange}
						maximumDate={maxDate}
						minimumDate={minDate}
					/>
				))}
		</View>
	);
};

const styles = StyleSheet.create({
	// Common styles
	container: {
		width: "100%"
	},
	touchableContainer: {
		width: "100%",
		position: "relative"
	},
	inputContainer: {
		...(Platform.OS !== "web" ? { pointerEvents: "none" as const } : {}),
		width: "100%"
	},
	disabledInput: {
		opacity: 0.7
	},

	// Web Calendar styles
	webContainer: {
		width: "100%"
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center"
	},
	modalContent: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 20,
		minWidth: 300,
		maxWidth: "90%"
	},
	calendarContent: {
		width: "100%"
	},

	// Calendar Header styles
	calendarHeader: {
		marginBottom: 16
	},
	monthYearSelectors: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center"
	},
	monthYearPicker: {
		flexDirection: "row",
		gap: 8
	},
	select: {
		padding: 4,
		borderRadius: 4,
		borderWidth: 1,
		borderColor: "#ddd",
		backgroundColor: "#fff"
	},

	// Calendar Grid styles
	weekDayHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 8
	},
	weekDayText: {
		flex: 1,
		textAlign: "center",
		fontWeight: "500",
		color: "#666"
	},
	calendarBody: {
		gap: 8
	},
	weekRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: 4
	},
	dayCell: {
		flex: 1,
		aspectRatio: 1,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 4
	},
	dayText: {
		fontSize: 14,
		color: "#333"
	},
	selectedDay: {
		backgroundColor: "#000"
	},
	selectedDayText: {
		color: "#fff"
	},
	disabledDay: {
		opacity: 0.3
	},
	disabledDayText: {
		color: "#999"
	},

	// iOS Modal styles
	iosModalOverlay: {
		flex: 1,
		justifyContent: "flex-end",
		backgroundColor: "rgba(0, 0, 0, 0.5)"
	},
	iosModalContent: {
		backgroundColor: "#fff",
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 16,
		paddingBottom: Platform.OS === "ios" ? 40 : 20
	},
	iosHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
		paddingBottom: 8
	},
	iosButton: {
		padding: 8
	},
	iosButtonText: {
		fontSize: 16,
		color: "#007AFF",
		paddingHorizontal: 8
	},
	iosDoneButton: {
		fontWeight: "600"
	},
	datePickerContainer: {
		backgroundColor: "#fff",
		padding: 16,
		alignItems: "center"
	},
	datePicker: {
		height: 200,
		width: "100%"
	}
});
