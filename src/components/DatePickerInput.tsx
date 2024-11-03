// src/components/DatePickerInput.tsx
import React, { useState, useRef } from "react";
import {
	Platform,
	TouchableOpacity,
	StyleSheet,
	View,
	Text,
	Modal
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
	maxDate = new Date()
}) => {
	const [showPicker, setShowPicker] = useState(false);
	const [selectedDate, setSelectedDate] = useState(value);
	const [currentMonth, setCurrentMonth] = useState(value.getMonth());
	const [currentYear, setCurrentYear] = useState(value.getFullYear());

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
		<>
			<TouchableOpacity
				onPress={() => editable && setShowPicker(true)}
				style={styles.container}
			>
				<FormInput
					label={label}
					value={value.toLocaleDateString()}
					editable={false}
					required={required}
					error={error}
					placeholder="Select date"
				/>
			</TouchableOpacity>

			{showPicker && (
				<DateTimePicker
					testID="dateTimePicker"
					value={value}
					mode="date"
					display={Platform.OS === "ios" ? "spinner" : "default"}
					onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
						if (Platform.OS === "android") {
							setShowPicker(false);
						}
						if (selectedDate && event.type !== "dismissed") {
							onChange(selectedDate);
						}
					}}
					maximumDate={maxDate}
					minimumDate={minDate}
				/>
			)}
		</>
	);
};

const styles = StyleSheet.create({
	webContainer: {
		width: "100%"
	},
	inputContainer: {
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
	container: {
		width: "100%"
	}
});
