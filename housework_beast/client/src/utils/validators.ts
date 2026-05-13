// utils/validators.ts - 输入验证工具

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateTaskName(name: string): ValidationResult {
  const errors: string[] = []

  if (!name || name.trim().length === 0) {
    errors.push('任务名称不能为空')
  }

  if (name && name.length > 50) {
    errors.push('任务名称不能超过50个字符')
  }

  if (name && /^[a-zA-Z0-9一-龥\s]+$/.test(name) === false) {
    errors.push('任务名称只能包含中文、英文、数字和空格')
  }

  return { valid: errors.length === 0, errors }
}

export function validateTaskPoints(points: number): ValidationResult {
  const errors: string[] = []

  if (!points || points < 1) {
    errors.push('积分必须大于0')
  }

  if (points > 100) {
    errors.push('积分不能超过100')
  }

  if (!Number.isInteger(points)) {
    errors.push('积分必须是整数')
  }

  return { valid: errors.length === 0, errors }
}

export function validateFamilyCode(code: string): ValidationResult {
  const errors: string[] = []

  if (!code) {
    errors.push('家庭代码不能为空')
  }

  if (code && code.length !== 6) {
    errors.push('家庭代码必须是6位')
  }

  if (code && !/^[A-Z0-9]{6}$/.test(code)) {
    errors.push('家庭代码只能包含大写字母和数字')
  }

  return { valid: errors.length === 0, errors }
}

export function validateMemberName(name: string): ValidationResult {
  const errors: string[] = []

  if (!name || name.trim().length === 0) {
    errors.push('成员名称不能为空')
  }

  if (name && name.length > 20) {
    errors.push('成员名称不能超过20个字符')
  }

  return { valid: errors.length === 0, errors }
}