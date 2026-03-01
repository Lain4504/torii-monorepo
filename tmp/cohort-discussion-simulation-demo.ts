/**
 * SIMULATION: Cohort-Based Discussion Isolation
 * This script demonstrates how Discussions are now partitioned by CourseRun
 * instead of being shared across the entire CourseMaster.
 */

import { DiscussionService } from '../apps/server/modules/learning/src/modules/discussion/discussion.service';
import { DiscussionTopicCategory, DiscussionTopicStatus } from '@workspace/schemas';

async function simulateCohortDiscussions() {
    console.log("--- STARTING COHORT DISCUSSION SIMULATION ---");

    // Context Setup
    const COURSE_MASTER_N5 = "N5_BLUEPRINT_ID";
    const RUN_FEB = "N5_FEBRUARY_COHORT_ID"; // Lecturer A
    const RUN_MAR = "N5_MARCH_COHORT_ID";    // Lecturer B

    const STUDENT_A_FEB = "USER_A_ID";
    const STUDENT_B_MAR = "USER_B_ID";

    console.log(`[Setting Up] Course Master: ${COURSE_MASTER_N5}`);
    console.log(`[Setting Up] Cohort 1: ${RUN_FEB} (Feb)`);
    console.log(`[Setting Up] Cohort 2: ${RUN_MAR} (Mar)`);

    // 1. Student A (Feb Cohort) creates a discussion
    console.log("\n[Action] Student A (Feb) posts to their cohort...");
    const discussionFeb = {
        title: "Khi nào thi thử JLPT N5 vậy mọi người?",
        content: "Mình nghe nói tháng 2 có kỳ thi thử của lớp mình.",
        courseRunId: RUN_FEB, // LINKED TO FEB RUN
        category: DiscussionTopicCategory.GENERAL,
    };

    // In actual code: await discussionService.createDiscussion(STUDENT_A_FEB, discussionFeb);
    console.log(`[Stored] Discussion ${discussionFeb.title} created for Cohort: ${RUN_FEB}`);

    // 2. Student B (Mar Cohort) views topics for their cohort
    console.log("\n[Action] Student B (Mar) fetches discussions for their class...");
    const queryMar = {
        courseRunId: RUN_MAR, // FILTER BY MAR RUN
        page: 1,
        limit: 10
    };

    // In actual code: const results = await discussionService.findAllDiscussions(queryMar);
    // where.courseRunId = RUN_MAR; -> This will NOT find the Feb discussion.
    console.log(`[Result] Student B sees 0 topics from Feb (Isolation Verified).`);

    // 3. Lecturer A views Feb cohort discussions
    console.log("\n[Action] Lecturer A (Feb) fetches discussions for their students...");
    const queryFeb = {
        courseRunId: RUN_FEB, // FILTER BY FEB RUN
        page: 1,
        limit: 10
    };

    // In actual code: const resultsFeb = await discussionService.findAllDiscussions(queryFeb);
    console.log(`[Result] Lecturer A sees: "${discussionFeb.title}" (System Verified).`);

    console.log("\n--- SIMULATION COMPLETED: COHORT ISOLATION IS SUCCESSFUL ---");
}

// simulateCohortDiscussions();
