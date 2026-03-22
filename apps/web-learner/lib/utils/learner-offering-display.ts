/**
 * Quy tắc hiển thị tên gói cho học viên (đã chốt nghiệp vụ):
 * - VOD: ưu tiên tên lớp (Class.name), tên gói chỉ là dòng phụ nếu khác.
 * - LIVE: tên gói (theo kỳ) là chính; thêm dòng ngữ cảnh kỳ nếu có.
 */
export type LearnerOfferingDisplay = {
  learnerDisplayTitle: string
  /** VOD: tên gói marketing khi khác tên lớp */
  learnerMarketingSubtitle: string | null
  /** LIVE: một dòng mô tả kỳ (nếu có) */
  liveContextLine: string | null
}

export function computeLearnerOfferingDisplay(
  item: any,
  opts: {
    isLive: boolean
    primaryClass: any | null
    profile: any | null
    /** Lớp cùng kỳ (LIVE) hoặc [primaryClass] — để lấy term khi không có item.term */
    classesForTerm: any[]
  },
): LearnerOfferingDisplay {
  const offeringTitle = String(item?.title ?? "").trim()
  const className = String(opts.primaryClass?.name ?? "").trim()
  const profileTitle = String(opts.profile?.title ?? "").trim()

  if (opts.isLive) {
    const firstWithTerm =
      opts.classesForTerm?.find((c: any) => c?.term) ?? opts.primaryClass
    const term = item?.term ?? firstWithTerm?.term ?? null
    let liveContextLine: string | null = null
    if (term) {
      const label = String(term.name ?? "").trim() || String(term.code ?? "").trim()
      if (label) {
        liveContextLine = `Kỳ: ${label}`
      } else if (term.openingDate) {
        liveContextLine = `Khai giảng: ${new Date(term.openingDate).toLocaleDateString("vi-VN")}`
      }
    }

    return {
      learnerDisplayTitle: offeringTitle || profileTitle || className || "Khóa học",
      learnerMarketingSubtitle: null,
      liveContextLine,
    }
  }

  const learnerDisplayTitle =
    className || profileTitle || offeringTitle || "Khóa học"
  const learnerMarketingSubtitle =
    className && offeringTitle && className !== offeringTitle
      ? offeringTitle
      : null

  return {
    learnerDisplayTitle,
    learnerMarketingSubtitle,
    liveContextLine: null,
  }
}
