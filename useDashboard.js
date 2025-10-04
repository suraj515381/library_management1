import { useState, useEffect } from "react";
import useUpload from "@/utils/useUpload";

export function useDashboard() {
  const [language, setLanguage] = useState("hindi");
  const [libraryData, setLibraryData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showBulkMessage, setShowBulkMessage] = useState(false);
  const [showEditStudent, setShowEditStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [upload, { loading: uploadLoading }] = useUpload();

  const [newStudent, setNewStudent] = useState({
    name: "",
    phone: "",
    seatNumber: "",
    startDate: "",
    endDate: "",
    photoUrl: "",
  });

  const [bulkMessage, setBulkMessage] = useState("");

  useEffect(() => {
    const storedLibraryData = localStorage.getItem("libraryData");
    if (!storedLibraryData) {
      window.location.href = "/login";
      return;
    }

    const library = JSON.parse(storedLibraryData);
    setLibraryData(library);
    loadStudents(library.id);
  }, []);

  const loadStudents = async (libraryId) => {
    try {
      const response = await fetch(`/api/students/list?libraryId=${libraryId}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/students/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newStudent,
          libraryId: libraryData.id,
          seatNumber: parseInt(newStudent.seatNumber),
        }),
      });

      if (response.ok) {
        setShowAddStudent(false);
        setNewStudent({
          name: "",
          phone: "",
          seatNumber: "",
          startDate: "",
          endDate: "",
          photoUrl: "",
        });
        loadStudents(libraryData.id);
      }
    } catch (error) {
      console.error("Error adding student:", error);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { url } = await upload({ file });
      if (url) {
        setNewStudent({ ...newStudent, photoUrl: url });
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const handleEditPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { url } = await upload({ file });
      if (url) {
        setEditingStudent({ ...editingStudent, photoUrl: url });
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const handleBulkMessage = async () => {
    try {
      const response = await fetch("/api/notifications/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          libraryId: libraryData.id,
          message: bulkMessage,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setShowBulkMessage(false);
        setBulkMessage("");

        if (result.whatsappUrls && result.whatsappUrls.length > 0) {
          const hindiMessage = `${result.totalStudents} स्टूडेंट्स को मैसेज भेजने के 3 तरीके:

तरीका 1: एक-एक करके भेजें (सबसे आसान)
तरीका 2: WhatsApp Broadcast का उपयोग करें 
तरीका 3: सभी नंबर कॉपी करें और मैन्युअल भेजें

कौन सा तरीका चुनना चाहते हैं?`;

          const englishMessage = `3 ways to send message to ${result.totalStudents} students:

Method 1: Send one by one (Easiest)
Method 2: Use WhatsApp Broadcast
Method 3: Copy all numbers and send manually

Which method would you like to choose?`;

          const userChoice = prompt(
            language === "hindi" ? hindiMessage : englishMessage,
            "1",
          );

          if (userChoice === "1") {
            // Method 1: Open first WhatsApp URL and show others in console
            window.open(result.whatsappUrls[0].whatsappUrl, "_blank");

            let urlList =
              language === "hindi"
                ? "बाकी स्टूडेंट्स के WhatsApp लिंक्स:\n\n"
                : "Remaining student WhatsApp links:\n\n";

            result.whatsappUrls.slice(1).forEach((item, index) => {
              urlList += `${index + 2}. ${item.studentName}: ${item.whatsappUrl}\n`;
            });

            console.log(urlList);
            console.log("सभी लिंक्स ऊपर दिए गए हैं। एक-एक करके क्लिक करें।");

            // Create a simple way to open all links
            const openAllButton = confirm(
              language === "hindi"
                ? "क्या आप सभी WhatsApp लिंक्स को एक साथ खोलना चाहते हैं? (ब्राउज़र में कई टैब खुलेंगे)"
                : "Do you want to open all WhatsApp links at once? (Multiple browser tabs will open)",
            );

            if (openAllButton) {
              result.whatsappUrls.forEach((item, index) => {
                setTimeout(() => {
                  window.open(item.whatsappUrl, `_blank_${index}`);
                }, index * 1000); // 1 second delay between each link
              });
            }

            alert(
              language === "hindi"
                ? `पहला लिंक खुल गया है। बाकी ${result.totalStudents - 1} लिंक्स कंसोल में देखें या सभी एक साथ खोलें।`
                : `First link opened. Check console for remaining ${result.totalStudents - 1} links or open all at once.`,
            );
          } else if (userChoice === "2") {
            // Method 2: Broadcast list
            const broadcastInfo =
              language === "hindi"
                ? `WhatsApp Broadcast करने के लिए:

1. WhatsApp खोलें
2. Menu → New Broadcast बनाएं  
3. ये नंबर्स जोड़ें:

${result.bulkInstructions.phoneList}

4. मैसेज भेजें: "${result.bulkInstructions.message}"`
                : `To create WhatsApp Broadcast:

1. Open WhatsApp
2. Menu → Create New Broadcast
3. Add these numbers:

${result.bulkInstructions.phoneList}

4. Send message: "${result.bulkInstructions.message}"`;

            alert(broadcastInfo);

            // Copy to clipboard if possible
            if (navigator.clipboard) {
              navigator.clipboard.writeText(result.bulkInstructions.phoneList);
              alert(
                language === "hindi"
                  ? "फोन नंबर्स क्लिपबोर्ड में कॉपी हो गए!"
                  : "Phone numbers copied to clipboard!",
              );
            }
          } else if (userChoice === "3") {
            // Method 3: Complete list
            const completeList =
              language === "hindi"
                ? `सभी स्टूडेंट्स की जानकारी:

${result.bulkInstructions.studentList}

मैसेज: "${result.bulkInstructions.message}"

कुल स्टूडेंट्स: ${result.totalStudents}`
                : `All students information:

${result.bulkInstructions.studentList}

Message: "${result.bulkInstructions.message}"

Total Students: ${result.totalStudents}`;

            alert(completeList);
            console.log(
              "Complete student list:",
              result.bulkInstructions.studentList,
            );
          }
        }
      }
    } catch (error) {
      console.error("Error sending bulk message:", error);
      alert(
        language === "hindi"
          ? "मैसेज भेजने में समस्या हुई।"
          : "Error sending bulk message.",
      );
    }
  };

  const handleCheckExpiry = async () => {
    try {
      const response = await fetch("/api/notifications/check-expiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ libraryId: libraryData.id }),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.totalExpiring > 0) {
          const message =
            language === "hindi"
              ? `${result.totalExpiring} स्टूडेंट्स की मेंबरशिप समाप्त हो रही है। WhatsApp रिमाइंडर भेजें?`
              : `${result.totalExpiring} students have expiring memberships. Send WhatsApp reminders?`;
          const confirmSend = confirm(message);
          if (
            confirmSend &&
            result.whatsappUrls &&
            result.whatsappUrls.length > 0
          ) {
            const studentUrls = result.whatsappUrls.filter(
              (url) => !url.isOwnerNotification,
            );
            if (studentUrls.length > 0) {
              window.open(studentUrls[0].whatsappUrl, "_blank");
            }
            alert(
              language === "hindi"
                ? `आज समाप्त: ${result.expiredToday}, कल समाप्त: ${result.expiringTomorrow}`
                : `Expired today: ${result.expiredToday}, Expiring tomorrow: ${result.expiringTomorrow}`,
            );
          }
        } else {
          alert(
            language === "hindi"
              ? "कोई मेंबरशिप समाप्त नहीं हो रही।"
              : "No memberships are expiring.",
          );
        }
      }
    } catch (error) {
      console.error("Error checking expiry:", error);
    }
  };

  const handleSendMessage = async (studentId, studentPhone, studentName) => {
    const message = prompt(
      language === "hindi"
        ? `${studentName} को मैसेज भेजें:`
        : `Send message to ${studentName}:`,
    );
    if (message) {
      try {
        const response = await fetch("/api/notifications/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            libraryId: libraryData.id,
            studentId: studentId,
            message: message,
          }),
        });
        if (response.ok) {
          const result = await response.json();
          window.open(result.notification.whatsappUrl, "_blank");
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent({
      id: student.id,
      name: student.name,
      phone: student.phone,
      seatNumber: student.seatNumber.toString(),
      startDate: student.startDate,
      endDate: student.endDate,
      photoUrl: student.photoUrl || "",
    });
    setShowEditStudent(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/students/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingStudent,
          libraryId: libraryData.id,
          seatNumber: parseInt(editingStudent.seatNumber),
        }),
      });
      if (response.ok) {
        setShowEditStudent(false);
        setEditingStudent(null);
        loadStudents(libraryData.id);
        alert(
          language === "hindi"
            ? "स्टूडेंट की जानकारी अपडेट हो गई!"
            : "Student information updated!",
        );
      } else {
        const errorData = await response.json();
        alert(
          language === "hindi"
            ? "अपडेट में समस्या: " + errorData.error
            : "Update failed: " + errorData.error,
        );
      }
    } catch (error) {
      console.error("Error updating student:", error);
      alert(language === "hindi" ? "अपडेट में समस्या हुई।" : "Update failed.");
    }
  };

  const handleDeleteStudent = async (student) => {
    const confirmMessage =
      language === "hindi"
        ? `क्या आप वाकई ${student.name} (सीट ${student.seatNumber}) को डिलीट करना चाहते हैं?`
        : `Are you sure you want to delete ${student.name} (Seat ${student.seatNumber})?`;
    if (!confirm(confirmMessage)) return;
    try {
      const response = await fetch("/api/students/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: student.id, libraryId: libraryData.id }),
      });
      if (response.ok) {
        loadStudents(libraryData.id);
        alert(
          language === "hindi"
            ? "स्टूडेंट डिलीट हो गया!"
            : "Student deleted successfully!",
        );
      } else {
        const errorData = await response.json();
        alert(
          language === "hindi"
            ? "डिलीट में समस्या: " + errorData.error
            : "Delete failed: " + errorData.error,
        );
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      alert(language === "hindi" ? "डिलीट में समस्या हुई।" : "Delete failed.");
    }
  };

  const getAvailableSeats = () => {
    if (!libraryData) return [];
    const occupiedSeats = students.map((s) => s.seatNumber);
    return Array.from(
      { length: libraryData.totalSeats },
      (_, i) => i + 1,
    ).filter((seat) => !occupiedSeats.includes(seat));
  };

  const getAvailableSeatsForEdit = (currentSeat) => {
    if (!libraryData) return [];
    const occupiedSeats = students
      .map((s) => s.seatNumber)
      .filter((seat) => seat !== currentSeat);
    const available = Array.from(
      { length: libraryData.totalSeats },
      (_, i) => i + 1,
    ).filter((seat) => !occupiedSeats.includes(seat));
    return available.sort((a, b) => a - b);
  };

  const getExpiringToday = () => {
    const today = new Date().toISOString().split("T")[0];
    return students.filter((s) => s.endDate === today);
  };

  const handleLogout = () => {
    localStorage.removeItem("libraryData");
    window.location.href = "/";
  };

  return {
    language,
    setLanguage,
    libraryData,
    students,
    loading,
    showAddStudent,
    setShowAddStudent,
    showBulkMessage,
    setShowBulkMessage,
    showEditStudent,
    setShowEditStudent,
    editingStudent,
    setEditingStudent,
    uploadLoading,
    newStudent,
    setNewStudent,
    bulkMessage,
    setBulkMessage,
    loadStudents,
    handleAddStudent,
    handlePhotoUpload,
    handleEditPhotoUpload,
    handleBulkMessage,
    handleCheckExpiry,
    handleSendMessage,
    handleEditStudent,
    handleUpdateStudent,
    handleDeleteStudent,
    getAvailableSeats,
    getAvailableSeatsForEdit,
    getExpiringToday,
    handleLogout,
  };
}
