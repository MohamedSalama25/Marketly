// forgotPasswordFunctions.js
import { supabase } from "./supabaseClient";

/**
 * إرسال كود استعادة كلمة المرور إلى البريد
 */
export const sendOtpToEmail = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      return {
        success: false,
        message: "حدث خطأ أثناء إرسال كود التحقق.",
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
 * التحقق من كود OTP الخاص باستعادة كلمة المرور
 */
export const verifyOtp = async (email, token) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "recovery",
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
export const updatePassword = async (newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        success: false,
        message: "حدث خطأ أثناء تحديث كلمة المرور.",
        details: error.message,
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