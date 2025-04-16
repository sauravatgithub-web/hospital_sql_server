export const formatAppointments = (rows) => {
    const appointmentsMap = new Map();

    for (const row of rows) {
        const aid = row.appointment_id;

        if (!appointmentsMap.has(aid)) {
            appointmentsMap.set(aid, {
                _id: aid,
                name: row.patient_name,
                age: row.patient_age,
                time: row.time,
                dischargeTime: row.dischargeTime,
                status: row.status,
                active: row.active,

                patient: {
                    _id: row.patient_id,
                    name: row.patient_name,
                    addr: row.patient_address,
                    age: row.patient_age,
                    phoneNumber: row.patient_phone,
                    email: row.patient_email,
                    userName: row.patient_username,
                    gender: row.patient_gender,
                    gname: row.patient_guardian_name,
                    gPhoneNo: row.patient_guardian_phone,
                },

                doctor: {
                    _id: row.doctor_id,
                    name: row.doctor_name,
                    gender: row.doctor_gender,
                    phoneNumber: row.doctor_phone,
                    inTime: row.doctor_in_time,
                    outTime: row.doctor_out_time,
                    spec: row.doctor_specialization,
                    room: {
                        _id: row.doctor_room,
                        name: row.doctor_roomName,
                    },
                },

                room: {
                    _id: row.patient_room,
                    name: row.patient_roomName,
                },

                bed: {
                    _id: row.bed_id,
                    name: row.bed_name,
                    isOccupied: row.bed_occupied,
                },

                drugs: [],
                disease: [],
                tests: [],
                nurse: [],
                remarks: [],
                hps: [],
            });
        }

        const appointment = appointmentsMap.get(aid);

        if (row.drug_id && !appointment.drugs.find(d => d.drug && d.drug._id === row.drug_id)) {
            appointment.drugs.push({
                drug: { _id: row.drug_id, name: row.drug_name },
                dosage: row.drug_dosage,
            });
        }

        if (row.disease_id && !appointment.disease.find(d => d._id === row.disease_id)) {
            appointment.disease.push({
                _id: row.disease_id,
                name: row.disease_name,
            });
        }

        if (row.test_id && !appointment.tests.find(t => t.test && t.test._id === row.test_id)) {
            appointment.tests.push({
                test: {
                    _id: row.test_id,
                    name: row.test_name,
                    room: row.test_room_id ? { _id: row.test_room_id, name: row.test_room_name } : undefined,
                    doctor: row.test_doctor_id ? { _id: row.test_doctor_id, name: row.test_doctor_name } : undefined
                },
                remark: row.test_remark,
            });
        }

        if (row.nurse_id && !appointment.nurse.find(n => n._id === row.nurse_id)) {
            appointment.nurse.push({
                _id: row.nurse_id,
                name: row.nurse_name,
                phoneNumber: row.nurse_phone,
                shift: row.nurse_shift,
                gender: row.nurse_gender,
            });
        }

        if (row.nurse_id && row.nurse_remark_time && row.nurse_remark_msg && !appointment.remarks.find((val) => new Date(val.remarkTime).getTime() === new Date(row.nurse_remark_time).getTime())) {
            appointment.remarks.push({
                remarkTime: row.nurse_remark_time,
                remarkUser: row.nurse_name,
                remarkUserRole: 'Nurse',
                remarkMsg: row.nurse_remark_msg,
            });
        }

        if (row.doctor_id && row.doctor_remark_time && row.doctor_remark_msg && !appointment.remarks.find((val) => new Date(val.remarkTime).getTime() === new Date(row.doctor_remark_time).getTime())) {
            appointment.remarks.push({
                remarkTime: row.doctor_remark_time,
                remarkUser: row.doctor_name,
                remarkUserRole: 'Doctor',
                remarkMsg: row.doctor_remark_msg,
            });
        }

        if (row.hps_id && !appointment.hps.find(h => h._id === row.hps_id)) {
            appointment.hps.push({
                _id: row.hps_id,
                name: row.hps_name,
                phoneNumber: row.hps_phone,
                gender: row.hps_gender,
            });
        }
    }

    return Array.from(appointmentsMap.values());
};

export const formatAppointments2 = (rows) => {
    const appointmentsMap = new Map();

    for (const row of rows) {
        const aid = row.appointment_id;

        if (!appointmentsMap.has(aid)) {
            appointmentsMap.set(aid, {
                _id: aid,
                name: row.patient_name,
                age: row.patient_age,
                time: row.time,
                dischargeTime: row.dischargeTime,
                status: row.status,
                active: row.active,

                patient: {
                    _id: row.patient_id,
                    name: row.patient_name,
                    addr: row.patient_address,
                    age: row.patient_age,
                    phoneNumber: row.patient_phone,
                    email: row.patient_email,
                    userName: row.patient_username,
                    gender: row.patient_gender,
                    gname: row.patient_guardian_name,
                    gPhoneNo: row.patient_guardian_phone,
                },

                doctor: {
                    _id: row.doctor_id,
                    name: row.doctor_name,
                    gender: row.doctor_gender,
                    phoneNumber: row.doctor_phone,
                    inTime: row.doctor_in_time,
                    outTime: row.doctor_out_time,
                    spec: row.doctor_specialization,
                    room: {
                        _id: row.doctor_roomId,
                        name: row.doctor_roomName,
                    },
                },

                room: {
                    _id: row.patient_roomId,
                    name: row.patient_roomName,
                },

                bed: {
                    _id: row.bed_id,
                    name: row.bed_name,
                    isOccupied: row.bed_occupied,
                },

                drugs: [],
                disease: [],
                tests: [],
                nurse: [],
                remarks: [],
                hps: [],
            });
        }

        const appointment = appointmentsMap.get(aid);

        if (row.drug_id && !appointment.drugs.find(d => d.drug && d.drug._id === row.drug_id)) {
            appointment.drugs.push({
                drug: { _id: row.drug_id, name: row.drug_name },
                dosage: row.drug_dosage,
            });
        }

        if (row.disease_id && !appointment.disease.find(d => d._id === row.disease_id)) {
            appointment.disease.push({
                _id: row.disease_id,
                name: row.disease_name,
            });
        }

        if (row.test_id && !appointment.tests.find(t => t.test && t.test._id === row.test_id)) {
            appointment.tests.push({
                test: {
                    _id: row.test_id,
                    name: row.test_name,
                    room: row.test_room_id ? { _id: row.test_room_id, name: row.test_room_name } : undefined,
                    doctor: row.test_doctor_id ? { _id: row.test_doctor_id, name: row.test_doctor_name } : undefined
                },
                remark: row.test_remark,
            });
        }

        if (row.nurse_id && !appointment.nurse.find(n => n._id === row.nurse_id)) {
            appointment.nurse.push({
                _id: row.nurse_id,
                name: row.nurse_name,
                phoneNumber: row.nurse_phone,
                shift: row.nurse_shift,
                gender: row.nurse_gender,
            });
        }

        if (row.nurse_id && row.nurse_remark_time && row.nurse_remark_msg) {
            appointment.remarks.push({
                remarkTime: row.nurse_remark_time,
                remarkUser: row.nurse_name,
                remarkUserRole: 'Nurse',
                remarkMsg: row.nurse_remark_msg,
            });
        }

        if (row.doctor_id && row.doctor_remark_time && row.doctor_remark_msg) {
            appointment.remarks.push({
                remarkTime: row.doctor_remark_time,
                remarkUser: row.doctor_name,
                remarkUserRole: 'Doctor',
                remarkMsg: row.doctor_remark_msg,
            });
        }

        if (row.hps_id && !appointment.hps.find(h => h._id === row.hps_id)) {
            appointment.hps.push({
                _id: row.hps_id,
                name: row.hps_name,
                phoneNumber: row.hps_phone,
                gender: row.hps_gender,
            });
        }
    }

    return Array.from(appointmentsMap.values());
};

export const formatAppointments3 = (rows) => {
    const appointmentsMap = new Map();

    for (const row of rows) {
        const aid = row.appointment_id;

        if (!appointmentsMap.has(aid)) {
            appointmentsMap.set(aid, {
                _id: aid,
                name: row.patient_name,
                time: row.time,
                dischargeTime: row.dischargeTime,
                status: row.status,
                active: row.active,

                patient: {
                    _id: row.patient_id,
                    name: row.patient_name,
                    addr: row.patient_address,
                    age: row.patient_age,
                    phoneNumber: row.patient_phone,
                    email: row.patient_email,
                    userName: row.patient_username,
                    gender: row.patient_gender,
                    gname: row.patient_guardian_name,
                    gPhoneNo: row.patient_guardian_phone,
                },

                doctor: {
                    _id: row.doctor_id,
                    name: row.doctor_name,
                    gender: row.doctor_gender,
                    phoneNumber: row.doctor_phone,
                    inTime: row.doctor_in_time,
                    outTime: row.doctor_out_time,
                    spec: row.doctor_specialization,
                    room: {
                        _id: row.doctor_roomId,
                        name: row.doctor_roomName,
                    },
                },

                room: {
                    _id: row.patient_roomId,
                    name: row.patient_roomName,
                },

                bed: {
                    _id: row.bed_id,
                    name: row.bed_name,
                    isOccupied: row.bed_occupied,
                },

                drugs: [],
                disease: [],
                tests: [],
                nurse: [],
                remarks: [],
                hps: [],
            });
        }

        const appointment = appointmentsMap.get(aid);

        if (row.drug_id && !appointment.drugs.find(d => d.drug && d.drug._id === row.drug_id)) {
            appointment.drugs.push({
                drug: { _id: row.drug_id, name: row.drug_name },
                dosage: row.drug_dosage,
            });
        }

        if (row.disease_id && !appointment.disease.find(d => d._id === row.disease_id)) {
            appointment.disease.push({
                _id: row.disease_id,
                name: row.disease_name,
            });
        }

        if (row.test_id && !appointment.tests.find(t => t.test && t.test._id === row.test_id)) {
            appointment.tests.push({
                test: {
                    _id: row.test_id,
                    name: row.test_name,
                    room: row.test_room_id ? { _id: row.test_room_id, name: row.test_room_name } : undefined,
                    doctor: row.test_doctor_id ? { _id: row.test_doctor_id, name: row.test_doctor_name } : undefined
                },
                remark: row.test_remark,
            });
        }

        if (row.nurse_id && !appointment.nurse.find(n => n._id === row.nurse_id)) {
            appointment.nurse.push({
                _id: row.nurse_id,
                name: row.nurse_name,
                phoneNumber: row.nurse_phone,
                shift: row.nurse_shift,
                gender: row.nurse_gender,
            });
        }

        if (row.nurse_id && row.nurse_remark_time && row.nurse_remark_msg) {
            appointment.remarks.push({
                remarkTime: row.nurse_remark_time,
                remarkUser: row.nurse_name,
                remarkUserRole: 'Nurse',
                remarkMsg: row.nurse_remark_msg,
            });
        }

        if (row.doctor_id && row.doctor_remark_time && row.doctor_remark_msg) {
            appointment.remarks.push({
                remarkTime: row.doctor_remark_time,
                remarkUser: row.doctor_name,
                remarkUserRole: 'Doctor',
                remarkMsg: row.doctor_remark_msg,
            });
        }

        if (row.hps_id && !appointment.hps.find(h => h._id === row.hps_id)) {
            appointment.hps.push({
                _id: row.hps_id,
                name: row.hps_name,
                phoneNumber: row.hps_phone,
                gender: row.hps_gender,
            });
        }
    }

    return Array.from(appointmentsMap.values());
};