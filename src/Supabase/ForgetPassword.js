// forgotPasswordFunctions.js
import { supabase } from "./supabaseClient";

/**
 * إرسال كود OTP إلى البريد الإلكتروني
 */
export const sendOtpToEmail = async (email) => {
  try {
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      return {
        success: false,
        message: "تأكد من أن البريد مسجل بالفعل!",
        details: error.message,
      };
    }

    return {
      success: true,
      message: "تم إرسال كود التحقق إلى بريدك الإلكتروني.",
    };
  } catch (error) {
    return {
      success: false,
      message: "حدث خطأ أثناء إرسال كود التحقق",
      details: error.message,
    };
  }
};

/**
 * التحقق من كود OTP المُرسل للبريد
 */
export const verifyOtp = async (email, token) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) {
      return {
        success: false,
        message: "الكود غير صحيح أو انتهت صلاحيته",
        details: error.message,
      };
    }

    return {
      success: true,
      message: "تم التحقق من الكود بنجاح.",
      session: data?.session,
    };
  } catch (error) {
    return {
      success: false,
      message: "حدث خطأ أثناء التحقق من الكود",
      details: error.message,
    };
  }
};


/**
 * تحديث كلمة المرور بعد التحقق من الكود
 */
export const updatePassword = async (email, newPassword) => {
  try {
    // ابحث عن المستخدم بالـ email
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        message: "هذا البريد غير مسجل.",
      };
    }

    // نفترض أنك بتخزن الباسورد كنص عادي، أو تقدر تضيف تشفير هنا لو عايز
    const { error: updateError } = await supabase
      .from("users")
      .update({ password: newPassword })
      .eq("id", userData.id);

    if (updateError) {
      return {
        success: false,
        message: "حدث خطأ أثناء تحديث كلمة المرور.",
        details: updateError.message,
      };
    }

    return {
      success: true,
      message: "تم تحديث كلمة المرور بنجاح.",
    };
  } catch (err) {
    return {
      success: false,
      message: "خطأ غير متوقع.",
      details: err.message,
    };
  }
};

